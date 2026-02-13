export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const throwError = (msg: string, code = 400) => {
  throw new AppError(msg, code);
};

// Authentication specific errors
export class AuthError extends AppError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode);
    this.name = 'AuthError';
  }

  static invalidCredentials(message: string = 'Invalid credentials') {
    return new AuthError(message, 401);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AuthError(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new AuthError(message, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return new AuthError(message, 404);
  }

  static conflict(message: string = 'Resource already exists') {
    return new AuthError(message, 409);
  }
}

// Error handler for API routes
export const handleError = (error: unknown) => {
  console.error('API Error:', error);

  // Handle Prisma known request errors
  if (error && typeof error === 'object' && 'code' in error && 'meta' in error) {
    const prismaError = error as any;
    
    // P2002: Unique constraint failed
    if (prismaError.code === 'P2002') {
      const targetField = prismaError.meta?.target?.[0] || 'field';
      return {
        success: false,
        message: `An admin with this ${targetField} already exists`,
        error: {
          code: 409,
          type: 'ConflictError',
          details: prismaError.meta,
        },
      };
    }
    
    // Other Prisma errors
    return {
      success: false,
      message: 'Database operation failed',
      error: {
        code: 500,
        type: 'DatabaseError',
        details: prismaError.meta,
      },
    };
  }

  if (error instanceof AuthError) {
    return {
      success: false,
      message: error.message,
      error: {
        code: error.statusCode,
        type: 'AuthError',
      },
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      error: {
        code: error.statusCode,
        type: 'AppError',
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
      error: {
        code: 500,
        type: 'Error',
      },
    };
  }

  return {
    success: false,
    message: 'Internal server error',
    error: {
      code: 500,
      type: 'UnknownError',
    },
  };
};
