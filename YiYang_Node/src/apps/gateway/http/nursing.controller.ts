import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
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
import type { Actor } from '../../../common/rbac/rbac.types.js'
import {
  assertGatewayRole,
  gatewayRoleMatrix,
} from '../security/gateway-rbac.util.js'

type GatewayRequest = { user: Actor }

@Controller('nursing')
@UseGuards(GatewayJwtGuard)
export class NursingController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Get('modules')
  getModules(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.nursingModules,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Get('care-levels')
  listCareLevels(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careLevelsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('care-levels')
  createCareLevel(@Req() request: GatewayRequest, @Body() body: SaveCareLevelDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.nursingAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careLevelsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('care-levels/:id')
  updateCareLevel(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveCareLevelDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.nursingAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careLevelsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('care-items')
  listCareItems(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careItemsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('care-items')
  createCareItem(@Req() request: GatewayRequest, @Body() body: SaveCareItemDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.nursingAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careItemsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('care-items/:id')
  updateCareItem(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveCareItemDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.nursingAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careItemsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('care-records')
  listCareRecords(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('care-records')
  createCareRecord(@Req() request: GatewayRequest, @Body() body: SaveCareRecordDto) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Post('care-records/ai-note')
  generateCareRecordAiNote(
    @Req() request: GatewayRequest,
    @Body() body: GenerateCareRecordNoteDto
  ) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsGenerateAiNote,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('care-records/:id')
  updateCareRecord(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveCareRecordDto
  ) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.nursingAdmin,
      ...gatewayRoleMatrix.nursingReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Delete('care-records/:id')
  deleteCareRecord(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.nursingAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.careRecordsDelete,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }
}
