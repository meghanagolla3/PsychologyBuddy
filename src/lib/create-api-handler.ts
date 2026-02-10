import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ErrorHandler, AppError } from '../errors/custom-errors'
import { AuthMiddleware } from '../auth/auth-middleware'

export interface APIHandlerConfig {
  requireAuth?: boolean
  rateLimit?: {
    windowMs: number
    max: number
  }
  roles?: string[]
}

export interface APIHandler<T = any> {
  post?: (data: T, context?: any) => Promise<any>
  get?: (params: URLSearchParams, context?: any) => Promise<any>
  put?: (data: T, params: URLSearchParams, context?: any) => Promise<any>
  delete?: (params: URLSearchParams, context?: any) => Promise<any>
}

class APIHandlerFactory {
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  static create<T extends z.ZodSchema>(
    schema: T,
    config: APIHandlerConfig = {}
  ) {
    return {
      post: (handler: (data: z.infer<T>, context?: any) => Promise<any>) => {
        return async (request: NextRequest): Promise<NextResponse> => {
          return this.handleRequest(request, async (body, context) => {
            const validatedData = schema.parse(body)
            return handler(validatedData, context)
          }, config)
        }
      },

      put: (handler: (data: z.infer<T>, params: URLSearchParams, context?: any) => Promise<any>) => {
        return async (request: NextRequest): Promise<NextResponse> => {
          return this.handleRequest(request, async (body, context) => {
            const { searchParams } = new URL(request.url)
            const validatedData = schema.parse(body)
            return handler(validatedData, searchParams, context)
          }, config)
        }
      }
    }
  }

  static createWithoutSchema(config: APIHandlerConfig = {}) {
    return {
      get: (handler: (params: URLSearchParams, context?: any) => Promise<any>) => {
        return async (request: NextRequest): Promise<NextResponse> => {
          return this.handleRequest(request, async (_, context) => {
            const { searchParams } = new URL(request.url)
            return handler(searchParams, context)
          }, config)
        }
      },

      delete: (handler: (params: URLSearchParams, context?: any) => Promise<any>) => {
        return async (request: NextRequest): Promise<NextResponse> => {
          return this.handleRequest(request, async (_, context) => {
            const { searchParams } = new URL(request.url)
            return handler(searchParams, context)
          }, config)
        }
      }
    }
  }

  private static async handleRequest(
    request: NextRequest,
    handler: (body: any, context?: any) => Promise<any>,
    config: APIHandlerConfig
  ): Promise<NextResponse> {
    try {
      // Rate limiting
      if (config.rateLimit) {
        const clientIp = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown'
        const now = Date.now()
        const rateLimitData = this.rateLimitStore.get(clientIp)

        if (rateLimitData && now < rateLimitData.resetTime) {
          if (rateLimitData.count >= config.rateLimit.max) {
            return NextResponse.json(
              { success: false, message: 'Too many requests' },
              { status: 429 }
            )
          }
          rateLimitData.count++
        } else {
          this.rateLimitStore.set(clientIp, {
            count: 1,
            resetTime: now + config.rateLimit.windowMs
          })
        }
      }

      // Authentication
      let context = {}
      if (config.requireAuth) {
        context = await this.authenticate(request, config.roles)
      }

      // Parse body
      let body = {}
      if (request.method !== 'GET') {
        try {
          body = await request.json()
        } catch (error) {
          // Body is optional for some requests
        }
      }

      // Execute handler
      const result = await handler(body, context)
      
      // Handle different response formats
      if (result instanceof NextResponse) {
        return result
      }

      return NextResponse.json({
        success: true,
        data: result
      })

    } catch (error) {
      return this.handleError(error as Error)
    }
  }

  private static async authenticate(request: NextRequest, roles?: string[]): Promise<any> {
    try {
      const auth = await AuthMiddleware.verifyAuth(request)
      
      if (roles && roles.length > 0 && !roles.includes(auth.role)) {
        throw new AppError('Insufficient permissions', 403)
      }

      return auth
    } catch (error) {
      throw new AppError('Authentication required', 401)
    }
  }

  private static handleError(error: Error): NextResponse {
    ErrorHandler.logError(error, 'API_HANDLER')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export const createAPIHandler = {
  post: <T extends z.ZodSchema>(
    schema: T,
    handler: (data: z.infer<T>, context?: any) => Promise<any>,
    config?: APIHandlerConfig
  ) => APIHandlerFactory.create(schema, config).post(handler),

  put: <T extends z.ZodSchema>(
    schema: T,
    handler: (data: z.infer<T>, params: URLSearchParams, context?: any) => Promise<any>,
    config?: APIHandlerConfig
  ) => APIHandlerFactory.create(schema, config).put(handler),

  get: (
    handler: (params: URLSearchParams, context?: any) => Promise<any>,
    config?: APIHandlerConfig
  ) => APIHandlerFactory.createWithoutSchema(config).get(handler),

  delete: (
    handler: (params: URLSearchParams, context?: any) => Promise<any>,
    config?: APIHandlerConfig
  ) => APIHandlerFactory.createWithoutSchema(config).delete(handler)
}

// Higher-order functions for common patterns
export const withAuth = (config: Omit<APIHandlerConfig, 'requireAuth'> = {}) => ({
  requireAuth: true,
  ...config
})

export const withRateLimit = (windowMs: number, max: number, config: APIHandlerConfig = {}) => ({
  rateLimit: { windowMs, max },
  ...config
})
