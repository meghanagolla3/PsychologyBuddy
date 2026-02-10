export class ValidationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code: string = 'VALIDATION_ERROR', statusCode: number = 400) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class DatabaseError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code: string = 'DATABASE_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code: string = 'AUTHENTICATION_ERROR', statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AuthorizationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code: string = 'AUTHORIZATION_ERROR', statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code: string = 'NOT_FOUND_ERROR', statusCode: number = 404) {
    super(message);
    this.name = 'NotFoundError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ConflictError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, code: string = 'CONFLICT_ERROR', statusCode: number = 409) {
    super(message);
    this.name = 'ConflictError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ErrorHandler {
  static handle(error: any): { statusCode: number; message: string; code: string } {
    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        message: error.message,
        code: error.code
      };
    }

    if (error instanceof Error) {
      return {
        statusCode: 500,
        message: error.message,
        code: 'INTERNAL_SERVER_ERROR'
      };
    }

    return {
      statusCode: 500,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
}
