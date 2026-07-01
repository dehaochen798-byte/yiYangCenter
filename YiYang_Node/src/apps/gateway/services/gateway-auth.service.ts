import { Injectable } from '@nestjs/common'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayServiceClient } from './gateway-service-client.js'

@Injectable()
export class GatewayAuthService {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  send<TResponse, TPayload>(pattern: unknown, payload: TPayload) {
    return this.gatewayClient.send<TResponse, TPayload>(
      SERVICE_NAMES.auth,
      pattern,
      payload
    )
  }
}
