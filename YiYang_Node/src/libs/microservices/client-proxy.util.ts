import { firstValueFrom, timeout } from 'rxjs'
import type { ClientProxy } from '@nestjs/microservices'

export async function sendTcpMessage<TResponse, TPayload>(
  client: ClientProxy,
  pattern: unknown,
  payload: TPayload
) {
  return firstValueFrom(client.send<TResponse, TPayload>(pattern, payload).pipe(timeout(5000)))
}
