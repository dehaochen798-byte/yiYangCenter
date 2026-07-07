import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { AUTH_PATTERNS } from '../../../libs/contracts/auth.contract.js'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayServiceClient } from '../services/gateway-service-client.js'
import type { Actor } from '../../../common/rbac/rbac.types.js'

@Injectable()
export class GatewayJwtGuard implements CanActivate {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string>; user?: Actor }>()
    const authorization = request.headers.authorization

    if (!authorization) {
      throw new UnauthorizedException('未提供认证凭证')
    }

    const result = await this.gatewayClient.send<
      { code: number; message: string; data?: unknown },
      { authorization: string }
    >(SERVICE_NAMES.auth, AUTH_PATTERNS.validateToken, { authorization })

    if (!result?.data) {
      throw new UnauthorizedException('登录状态无效')
    }

    request.user = result.data as Actor
    return true
  }
}
