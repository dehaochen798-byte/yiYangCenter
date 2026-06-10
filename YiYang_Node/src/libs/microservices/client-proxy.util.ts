import { firstValueFrom, timeout } from 'rxjs'
import type { ClientProxy } from '@nestjs/microservices'

export async function sendTcpMessage<TResponse, TPayload>(
  client: ClientProxy,
  pattern: unknown,
  payload: TPayload
) {
  const normalizedPayload = payload === undefined ? {} : payload

  return firstValueFrom(
    client.send<TResponse, TPayload | Record<string, never>>(pattern, normalizedPayload).pipe(timeout(5000))
  )
}
