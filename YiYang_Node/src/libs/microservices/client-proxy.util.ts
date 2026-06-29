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

  const payload = error as { code?: unknown; message?: unknown; error?: unknown }

  if (typeof payload.code === 'number' || typeof payload.message === 'string') {
    return payload
  }

  if (payload.message && typeof payload.message === 'object') {
    const nestedPayload = payload.message as { code?: unknown; message?: unknown }

    return nestedPayload
  }

  if (payload.error && typeof payload.error === 'object') {
    const nestedPayload = payload.error as { code?: unknown; message?: unknown }

    return nestedPayload
  }

  return null
}

function getHttpStatus(code: unknown) {
  return typeof code === 'number' && code >= 400 && code < 600
    ? code
    : HttpStatus.INTERNAL_SERVER_ERROR
}
