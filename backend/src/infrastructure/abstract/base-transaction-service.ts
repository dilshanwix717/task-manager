import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export abstract class BaseTransactionService<Input, Output> {
  private result: Output;

  constructor(public _dataSource: DataSource) {}

  protected abstract execute(
    transactionInput: Input,
    entityManager: EntityManager,
  ): Promise<Output>;

  public async runInTransactionBoundary(
    transactionInput: Input,
  ): Promise<Output> {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.result = await this.execute(transactionInput, queryRunner.manager);
      await queryRunner.commitTransaction();
      return this.result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
