import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { of } from 'rxjs'
import type { ClientProxy } from '@nestjs/microservices'
import { GatewayServiceClient } from '../src/apps/gateway/services/gateway-service-client.js'
import type { LocalRegistryService } from '../src/libs/registry/local-registry.service.js'
import { SERVICE_NAMES, type ServiceName } from '../src/libs/registry/registry.types.js'

class TestGatewayServiceClient extends GatewayServiceClient {
  readonly requestedServices: string[] = []

  override async getClient(serviceName: ServiceName) {
    this.requestedServices.push(serviceName)

    return {
      send: (_pattern: unknown, payload: unknown) =>
        of({
          code: 200,
          data: payload,
        }),
      close: () => undefined,
    } as unknown as ClientProxy
  }
}

describe('GatewayServiceClient', () => {
  it('sends messages through a client resolved by service name', async () => {
    const registry = {} as LocalRegistryService
    const gatewayClient = new TestGatewayServiceClient(registry)

    const result = await gatewayClient.send(
      SERVICE_NAMES.auth,
      { cmd: 'validate' },
      { authorization: 'Bearer token' }
    )

    assert.deepEqual(gatewayClient.requestedServices, [SERVICE_NAMES.auth])
    assert.deepEqual(result, {
      code: 200,
      data: {
        authorization: 'Bearer token',
      },
    })
  })
})
