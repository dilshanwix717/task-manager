import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TaskModel } from 'src/domain/models/task.model';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { ITokenPayload } from '../auth-module/interfaces/token-payload.interface';
import { ConfigurationService } from '../configurations/base-config/config.service';
import { ITaskEventsPublisher } from './task-events-publisher.interface';

export const TASK_EVENTS = {
  CREATED: 'task.created',
  UPDATED: 'task.updated',
  DELETED: 'task.deleted',
} as const;

const gatewayCorsOrigins = [
  'http://localhost:3000', // next.js dev server
  'http://frontend:3000', // docker internal network
];

if (process.env.FRONTEND_URL) gatewayCorsOrigins.push(process.env.FRONTEND_URL);

@WebSocketGateway({
  cors: {
    origin: gatewayCorsOrigins,
    credentials: true,
  },
})
export class TasksGateway implements OnGatewayConnection, ITaskEventsPublisher {
  private readonly logger = new Logger(TasksGateway.name);

  @WebSocketServer()
  private readonly _server: Server;

  constructor(
    private readonly _configService: ConfigurationService,

    private readonly _jwtService: JwtService,
  ) {}

  //sockets authenticate with the same jwt used for the http api
  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ??
      client.handshake.headers.authorization?.replace(/^Bearer /i, '');

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this._jwtService.verifyAsync<ITokenPayload>(token, {
        secret: this._configService.jwtConfig.secret,
      });

      //each user gets a private room, admins additionally share a global room
      await client.join(`user:${payload.userId}`);

      if (payload.role === UserRoleType.ADMIN) {
        await client.join('admins');
      }
    } catch {
      this.logger.debug('rejected a socket connection with an invalid token');
      client.disconnect(true);
    }
  }

  publishTaskCreated(task: TaskModel): void {
    this.emitToInterestedClients(TASK_EVENTS.CREATED, task);
  }

  publishTaskUpdated(task: TaskModel): void {
    this.emitToInterestedClients(TASK_EVENTS.UPDATED, task);
  }

  publishTaskDeleted(task: TaskModel): void {
    this.emitToInterestedClients(TASK_EVENTS.DELETED, task);
  }

  //socket.io deduplicates the union of rooms, so an admin owner gets the event once
  private emitToInterestedClients(event: string, task: TaskModel): void {
    this._server.to([`user:${task.owner.id}`, 'admins']).emit(event, task);
  }
}
