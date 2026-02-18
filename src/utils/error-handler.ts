// Custom error classes for better error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Prisma error handling utility
export function handlePrismaError(error: any): Error {
  // Handle common Prisma error codes
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target[0] : 'field';
      return new ValidationError(`${field} already exists`);
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found');
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Invalid reference provided');
    
    case 'P2014':
      // Invalid relation
      return new ValidationError('Invalid data relationship');
    
    case 'P2000':
      // Value too long
      return new ValidationError('Input value is too long');
    
    case 'P2001':
      // Record does not exist
      return new NotFoundError('Record not found');
    
    case 'P2004':
      // Constraint failed
      return new ValidationError('Data constraint violation');
    
    case 'P2005':
      // Invalid value
      return new ValidationError('Invalid data value provided');
    
    case 'P2006':
      // Invalid value for field
      return new ValidationError('Invalid value for field');
    
    case 'P2007':
      // Data validation error
      return new ValidationError('Data validation failed');
    
    case 'P2008':
      // Failed to parse query
      return new DatabaseError('Query parsing failed', error);
    
    case 'P2009':
      // Failed to validate query
      return new DatabaseError('Query validation failed', error);
    
    case 'P2010':
      // Transaction failed
      return new DatabaseError('Transaction failed', error);
    
    case 'P2011':
      // Null constraint violation
      return new ValidationError('Required field cannot be null');
    
    case 'P2012':
      // Missing value
      return new ValidationError('Required value is missing');
    
    case 'P2013':
      // Missing argument
      return new ValidationError('Required argument is missing');
    
    case 'P2016':
      // Query interpretation error
      return new DatabaseError('Query interpretation error', error);
    
    case 'P2017':
      // Query result error
      return new DatabaseError('Query result error', error);
    
    case 'P2018':
      // Required connected records not found
      return new ValidationError('Required related records not found');
    
    case 'P2019':
      // Input error
      return new ValidationError('Invalid input data');
    
    case 'P2020':
      // Value out of range
      return new ValidationError('Value out of allowed range');
    
    case 'P2021':
      // Table does not exist
      return new DatabaseError('Table not found', error);
    
    case 'P2022':
      // Column does not exist
      return new DatabaseError('Column not found', error);
    
    case 'P2023':
      // Inconsistent column data
      return new DatabaseError('Inconsistent column data', error);
    
    case 'P2024':
      // Timeout
      return new DatabaseError('Database operation timed out', error);
    
    case 'P2026':
      // Default value not set
      return new ValidationError('Default value not set');
    
    case 'P2027':
      // Multiple errors occurred
      return new DatabaseError('Multiple database errors occurred', error);
    
    case 'P2028':
      // Transaction API error
      return new DatabaseError('Transaction API error', error);
    
    case 'P2029':
      // Migration error
      return new DatabaseError('Migration error', error);
    
    case 'P2030':
      // Full-text search error
      return new DatabaseError('Full-text search error', error);
    
    case 'P2031':
      // Connection error
      return new DatabaseError('Database connection error', error);
    
    case 'P2032':
      // Required connected records not found
      return new ValidationError('Required connected records not found');
    
    case 'P2033':
      // Number of field values mismatch
      return new ValidationError('Number of field values mismatch');
    
    case 'P2034':
      // Transformation error
      return new DatabaseError('Data transformation error', error);
    
    case 'P2035':
      // Standalone error
      return new DatabaseError('Standalone database error', error);
    
    case 'P2036':
      // External adapter error
      return new DatabaseError('External adapter error', error);
    
    case 'P2037':
      // Multiple records found
      return new DatabaseError('Multiple records found when expecting single record', error);
    
    default:
      // Unknown error
      return new DatabaseError('Database operation failed', error);
  }
}

// Error response formatter
export function formatErrorResponse(error: Error) {
  const status = getErrorStatus(error);
  
  return {
    success: false,
    message: error.message,
    error: error.name,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: (error as any).originalError 
    })
  };
}

// Get appropriate HTTP status code for error type
function getErrorStatus(error: Error): number {
  switch (error.name) {
    case 'ValidationError':
      return 400;
    case 'NotFoundError':
      return 404;
    case 'AuthenticationError':
      return 401;
    case 'AuthorizationError':
      return 403;
    case 'DatabaseError':
      return 500;
    default:
      return 500;
  }
}

// Global error handler middleware for Next.js
export function handleGlobalError(error: unknown): Response {
  console.error('Unhandled error:', error);
  
  let formattedError: Error;
  
  if (error instanceof Error) {
    formattedError = error;
  } else {
    formattedError = new Error('Unknown error occurred');
  }
  
  const response = formatErrorResponse(formattedError);
  const status = getErrorStatus(formattedError);
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Async error wrapper for controllers
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      throw handlePrismaError(error);
    });
  };
}
