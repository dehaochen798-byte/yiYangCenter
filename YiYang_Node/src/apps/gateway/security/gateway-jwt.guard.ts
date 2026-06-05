import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { AUTH_PATTERNS } from '../../../libs/contracts/auth.contract.js'
import { sendTcpMessage } from '../../../libs/microservices/client-proxy.util.js'

@Injectable()
export class GatewayJwtGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: unknown }>()
    const authorization = request.headers.authorization

    if (!authorization) {
      throw new UnauthorizedException('未提供认证凭证')
    }

    const result = await sendTcpMessage<
      { code: number; message: string; data?: unknown },
      { authorization: string }
    >(
      this.authClient,
      AUTH_PATTERNS.validateToken,
      { authorization }
    )

    if (!result?.data) {
      throw new UnauthorizedException('登录状态无效')
    }

    request.user = result.data
    return true
  }
}
