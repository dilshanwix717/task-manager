import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { TaskEntity } from './task.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'user_name', length: 255, unique: true })
  userName: string;

  @Column({ type: 'varchar', name: 'email', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password', length: 255 })
  password: string;

  @Column({ type: 'boolean', name: 'status', default: true })
  status: boolean;

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    nullable: false,
  })
  @JoinColumn({ name: 'role' })
  role: Partial<RoleEntity>;

  @OneToMany(() => TaskEntity, (task) => task.owner)
  tasks: Partial<TaskEntity>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
