import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'
import { sendTcpMessage } from '../../../libs/microservices/client-proxy.util.js'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import {
  SaveCareItemDto,
  SaveCareLevelDto,
  SaveCareRecordDto,
} from '../../../modules/nursing/dto/nursing.dto.js'

@Controller('nursing')
@UseGuards(GatewayJwtGuard)
export class NursingController {
  constructor(@Inject('CARE_SERVICE') private readonly careClient: ClientProxy) {}

  @Get('modules')
  getModules() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.nursingModules, undefined)
  }

  @Get('care-levels')
  listCareLevels() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careLevelsList, undefined)
  }

  @Post('care-levels')
  createCareLevel(@Body() body: SaveCareLevelDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careLevelsCreate, body)
  }

  @Patch('care-levels/:id')
  updateCareLevel(@Param('id') id: string, @Body() body: SaveCareLevelDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careLevelsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('care-items')
  listCareItems() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careItemsList, undefined)
  }

  @Post('care-items')
  createCareItem(@Body() body: SaveCareItemDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careItemsCreate, body)
  }

  @Patch('care-items/:id')
  updateCareItem(@Param('id') id: string, @Body() body: SaveCareItemDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careItemsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('care-records')
  listCareRecords() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careRecordsList, undefined)
  }

  @Post('care-records')
  createCareRecord(@Body() body: SaveCareRecordDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careRecordsCreate, body)
  }

  @Patch('care-records/:id')
  updateCareRecord(@Param('id') id: string, @Body() body: SaveCareRecordDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.careRecordsUpdate, {
      id: Number(id),
      data: body,
    })
  }
}
