import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { throwError } from 'rxjs'
import { Prisma } from '../../../generated/prisma/client.js'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'

@Catch()
export class RpcExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return throwError(() => getRpcExceptionPayload(exception))
    }

    if (exception instanceof HttpException) {
      return throwError(
        () => ({
          code: exception.getStatus(),
          message: extractHttpExceptionMessage(exception),
        })
      )
    }

    const prismaExceptionPayload = getPrismaExceptionPayload(exception)

    if (prismaExceptionPayload) {
      return throwError(() => prismaExceptionPayload)
    }

    return throwError(
      () => ({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      })
    )
  }
}

function getRpcExceptionPayload(exception: RpcException) {
  const error = exception.getError()

  if (typeof error === 'string') {
    return {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    }
  }

  return error
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

function getPrismaExceptionPayload(exception: unknown) {
  if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  switch (exception.code) {
    case 'P2000':
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '字段内容超出长度限制',
      }
    case 'P2002':
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '数据已存在，请检查唯一字段',
      }
    case 'P2003':
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '关联数据不存在或已被使用',
      }
    case 'P2011':
      return {
        code: HttpStatus.BAD_REQUEST,
        message: '必填字段不能为空',
      }
    case 'P2025':
      return {
        code: HttpStatus.NOT_FOUND,
        message: '数据不存在',
      }
    default:
      return null
  }
}
