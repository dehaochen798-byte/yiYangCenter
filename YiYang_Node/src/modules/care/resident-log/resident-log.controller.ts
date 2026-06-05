import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { GatewayJwtGuard } from '../../../apps/gateway/security/gateway-jwt.guard.js'
import { ResidentLogService } from './resident-log.service.js'
import { CreateResidentLogDto } from './dto/create-resident-log.dto.js'
import { QueryResidentLogDto } from './dto/query-resident-log.dto.js'
import { UpdateResidentLogDto } from './dto/update-resident-log.dto.js'

@Controller('resident-logs')
@UseGuards(GatewayJwtGuard)
export class ResidentLogController {
  constructor(private readonly residentLogService: ResidentLogService) {}

  @Get()
  list(@Query() query: QueryResidentLogDto) {
    return this.residentLogService.list(query)
  }

  @Post()
  create(@Body() body: CreateResidentLogDto) {
    return this.residentLogService.create(body)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateResidentLogDto) {
    return this.residentLogService.update(Number(id), body)
  }
}
