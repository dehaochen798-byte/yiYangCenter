import { Body, Controller, Inject, Post } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { LoginDto } from '../../../modules/auth/dto/login.dto.js'
import { RegisterDto } from '../../../modules/auth/dto/register.dto.js'
import { AUTH_PATTERNS } from '../../../libs/contracts/auth.contract.js'
import { sendTcpMessage } from '../../../libs/microservices/client-proxy.util.js'

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return sendTcpMessage(this.authClient, AUTH_PATTERNS.register, dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return sendTcpMessage(this.authClient, AUTH_PATTERNS.login, dto)
  }
}
