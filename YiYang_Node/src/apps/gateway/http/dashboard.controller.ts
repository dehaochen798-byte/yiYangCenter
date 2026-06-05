import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import { sendTcpMessage } from '../../../libs/microservices/client-proxy.util.js'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'

@Controller('dashboard')
@UseGuards(GatewayJwtGuard)
export class DashboardController {
  constructor(@Inject('CARE_SERVICE') private readonly careClient: ClientProxy) {}

  @Get('summary')
  getSummary() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.dashboardSummary, undefined)
  }
}
