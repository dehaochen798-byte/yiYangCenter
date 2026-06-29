import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { throwError } from 'rxjs'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'

@Catch()
export class RpcExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return throwError(() => exception)
    }

    if (exception instanceof HttpException) {
      return throwError(
        () =>
          new RpcException({
            code: exception.getStatus(),
            message: extractHttpExceptionMessage(exception),
          })
      )
    }

    return throwError(
      () =>
        new RpcException({
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        })
    )
  }
}

function extractHttpExceptionMessage(exception: HttpException) {
  const response = exception.getResponse()

  if (typeof response === 'string') {
    return response
  }

  if (typeof response !== 'object' || response === null) {
    return exception.message
  }

  const message = (response as { message?: unknown }).message

  if (Array.isArray(message)) {
    return message.join('; ')
  }

  if (typeof message === 'string') {
    return message
  }

  return exception.message
}
