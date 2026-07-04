export class QueryResponseWithPagination<T> {
  count: number;
  currentPage: number;
  offset: number;
  results: T[];
}
