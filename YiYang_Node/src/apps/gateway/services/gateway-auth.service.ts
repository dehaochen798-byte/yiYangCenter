import { Inject, Injectable } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class GatewayAuthService {
  constructor(@Inject('AUTH_SERVICE') readonly authClient: ClientProxy) {}
}
