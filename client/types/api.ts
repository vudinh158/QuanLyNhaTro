export interface ApiResponse<T> {
    status: string;
    results?: number;
    data: {
      [key: string]: T | T[] | any;
    };
    message?: string;
  }