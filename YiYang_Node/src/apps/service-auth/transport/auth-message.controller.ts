import { Controller, UnauthorizedException } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { JwtService } from '@nestjs/jwt'
import { AUTH_PATTERNS } from '../../../libs/contracts/auth.contract.js'
import { AuthService } from '../../../modules/auth/auth.service.js'
import { LoginDto } from '../../../modules/auth/dto/login.dto.js'
import { RegisterDto } from '../../../modules/auth/dto/register.dto.js'
import { JwtStrategy } from '../../../modules/auth/jwt.strategy.js'

@Controller()
export class AuthMessageController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService
  ) {}

  @MessagePattern(AUTH_PATTERNS.register)
  register(dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @MessagePattern(AUTH_PATTERNS.login)
  login(dto: LoginDto) {
    return this.authService.login(dto)
  }

  @MessagePattern(AUTH_PATTERNS.validateToken)
  async validateToken(payload: { authorization?: string }) {
    const token = payload.authorization?.replace(/^Bearer\s+/i, '').trim()

    if (!token) {
      throw new UnauthorizedException('未提供有效 token')
    }

    const decoded = await this.jwtService.verifyAsync<{
      sub: number
      mobile: string
    }>(token)

    const user = await this.jwtStrategy.validate(decoded)

    return {
      code: 200,
      message: 'Token 校验通过',
      data: user,
    }
  }
}
