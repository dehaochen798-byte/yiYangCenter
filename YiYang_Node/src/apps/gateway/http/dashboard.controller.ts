import { Controller, Get, UseGuards } from '@nestjs/common'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'
import { GatewayServiceClient } from '../services/gateway-service-client.js'

@Controller('dashboard')
@UseGuards(GatewayJwtGuard)
export class DashboardController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Get('summary')
  getSummary() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.dashboardSummary,
      undefined
    )
  }
}
