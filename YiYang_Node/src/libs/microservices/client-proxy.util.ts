import { HttpException, HttpStatus } from '@nestjs/common'
import { firstValueFrom, timeout } from 'rxjs'
import type { ClientProxy } from '@nestjs/microservices'

export async function sendTcpMessage<TResponse, TPayload>(
  client: ClientProxy,
  pattern: unknown,
  payload: TPayload
) {
  const normalizedPayload = payload === undefined ? {} : payload

  try {
    return await firstValueFrom(
      client.send<TResponse, TPayload | Record<string, never>>(pattern, normalizedPayload).pipe(timeout(5000))
    )
  } catch (error) {
    const payload = getRpcErrorPayload(error)
    const status = getHttpStatus(payload?.code)

    throw new HttpException(payload?.message || 'Internal server error', status)
  }
}

function getRpcErrorPayload(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null
  }

  const payload = error as {
    code?: unknown
    error?: unknown
    message?: unknown
    status?: unknown
    statusCode?: unknown
  }

  const errorPayload = getPayloadObject(payload.error)

  if (errorPayload) {
    return errorPayload
  }

  const messagePayload = getPayloadObject(payload.message)

  if (messagePayload) {
    return messagePayload
  }

  if (
    typeof payload.code === 'number' ||
    typeof payload.statusCode === 'number' ||
    typeof payload.status === 'string'
  ) {
    return {
      code: payload.code ?? payload.statusCode,
      message: typeof payload.message === 'string' ? payload.message : undefined,
    }
  }

  return null
}

function getPayloadObject(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const payload = value as { code?: unknown; message?: unknown; statusCode?: unknown }

  if (
    typeof payload.code !== 'number' &&
    typeof payload.statusCode !== 'number' &&
    typeof payload.message !== 'string'
  ) {
    return null
  }

  return {
    code: payload.code ?? payload.statusCode,
    message: payload.message,
  }
}

function getHttpStatus(code: unknown) {
  return typeof code === 'number' && code >= 400 && code < 600
    ? code
    : HttpStatus.INTERNAL_SERVER_ERROR
}
