import { Body, Controller, Post } from '@nestjs/common'
import { LoginDto } from '../../../modules/auth/dto/login.dto.js'
import { RegisterDto } from '../../../modules/auth/dto/register.dto.js'
import { AUTH_PATTERNS } from '../../../libs/contracts/auth.contract.js'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayServiceClient } from '../services/gateway-service-client.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.gatewayClient.send(SERVICE_NAMES.auth, AUTH_PATTERNS.register, dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.gatewayClient.send(SERVICE_NAMES.auth, AUTH_PATTERNS.login, dto)
  }
}
