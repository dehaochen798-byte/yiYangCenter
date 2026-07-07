import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'
import { GatewayServiceClient } from '../services/gateway-service-client.js'
import type { Actor } from '../../../common/rbac/rbac.types.js'
import {
  assertGatewayRole,
  gatewayRoleMatrix,
} from '../security/gateway-rbac.util.js'

@Controller('dashboard')
@UseGuards(GatewayJwtGuard)
export class DashboardController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Get('summary')
  getSummary(@Req() request: { user: Actor }) {
    assertGatewayRole(request.user, gatewayRoleMatrix.dashboard)

    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.dashboardSummary,
      this.gatewayClient.withActorOnly(request.user)
    )
  }
}
