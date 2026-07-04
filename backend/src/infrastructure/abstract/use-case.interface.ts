export interface IUseCase<T, R> {
  execute(input?: T): Promise<R>;
}
