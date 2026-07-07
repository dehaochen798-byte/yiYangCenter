import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayServiceClient } from '../services/gateway-service-client.js'
import {
  GenerateCareRecordNoteDto,
  SaveCareItemDto,
  SaveCareLevelDto,
  SaveCareRecordDto,
} from '../../../modules/nursing/dto/nursing.dto.js'

@Controller('nursing')
@UseGuards(GatewayJwtGuard)
export class NursingController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Get('modules')
  getModules() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.nursingModules,
      undefined
    )
  }

  @Get('care-levels')
  listCareLevels() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careLevelsList,
      undefined
    )
  }

  @Post('care-levels')
  createCareLevel(@Body() body: SaveCareLevelDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careLevelsCreate,
      body
    )
  }

  @Patch('care-levels/:id')
  updateCareLevel(@Param('id') id: string, @Body() body: SaveCareLevelDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.careLevelsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('care-items')
  listCareItems() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careItemsList,
      undefined
    )
  }

  @Post('care-items')
  createCareItem(@Body() body: SaveCareItemDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careItemsCreate,
      body
    )
  }

  @Patch('care-items/:id')
  updateCareItem(@Param('id') id: string, @Body() body: SaveCareItemDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.careItemsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('care-records')
  listCareRecords() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsList,
      undefined
    )
  }

  @Post('care-records')
  createCareRecord(@Body() body: SaveCareRecordDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsCreate,
      body
    )
  }

  @Post('care-records/ai-note')
  generateCareRecordAiNote(@Body() body: GenerateCareRecordNoteDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsGenerateAiNote,
      body
    )
  }

  @Patch('care-records/:id')
  updateCareRecord(@Param('id') id: string, @Body() body: SaveCareRecordDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.careRecordsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Delete('care-records/:id')
  deleteCareRecord(@Param('id') id: string) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.careRecordsDelete, {
      id: Number(id),
    })
  }
}
