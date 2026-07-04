import { DeepPartial, EntityManager } from 'typeorm';

export interface IMainRepositoryInterface<T> {
  findById(id: string): Promise<T>;
  update(t: DeepPartial<T>, entityManager?: EntityManager): Promise<T>;
  create(t: DeepPartial<T>, entityManager?: EntityManager): Promise<T>;
  saveMany(t: T[], entityManager?: EntityManager): Promise<T[]>;
  findByIds(ids: string[]): Promise<T[]>;
}
