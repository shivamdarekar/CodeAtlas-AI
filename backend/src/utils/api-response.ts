export class ApiResponse<TData> {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: TData;

  constructor(statusCode: number, message: string, data: TData) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
