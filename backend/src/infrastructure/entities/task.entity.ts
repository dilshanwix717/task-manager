import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatusType,
    name: 'status',
    default: TaskStatusType.TODO,
  })
  status: TaskStatusType;

  @Column({ type: 'timestamptz', name: 'due_date' })
  dueDate: Date;

  //every task belongs to a user, removing the user removes their tasks
  @ManyToOne(() => UserEntity, (user) => user.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner' })
  owner: Partial<UserEntity>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
