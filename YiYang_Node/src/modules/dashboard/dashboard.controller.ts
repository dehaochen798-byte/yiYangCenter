import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { DashboardService } from './dashboard.service.js'
import type { Actor } from '../../common/rbac/rbac.types.js'

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Req() request: { user: Actor }) {
    return this.dashboardService.getSummary(request.user)
  }
}
