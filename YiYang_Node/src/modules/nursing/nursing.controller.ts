import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import {
  GenerateCareRecordNoteDto,
  SaveCareItemDto,
  SaveCareLevelDto,
  SaveCareRecordDto,
} from './dto/nursing.dto.js'
import { NursingService } from './nursing.service.js'
import type { Actor } from '../../common/rbac/rbac.types.js'

type AuthRequest = { user: Actor }

@Controller('nursing')
@UseGuards(JwtAuthGuard)
export class NursingController {
  constructor(private readonly nursingService: NursingService) {}

  @Get('modules')
  getModules(@Req() request: AuthRequest) {
    return this.nursingService.getModules(request.user)
  }

  @Get('care-levels')
  listCareLevels(@Req() request: AuthRequest) {
    return this.nursingService.listCareLevels(request.user)
  }

  @Post('care-levels')
  createCareLevel(@Req() request: AuthRequest, @Body() body: SaveCareLevelDto) {
    return this.nursingService.createCareLevel(request.user, body)
  }

  @Patch('care-levels/:id')
  updateCareLevel(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveCareLevelDto
  ) {
    return this.nursingService.updateCareLevel(request.user, Number(id), body)
  }

  @Get('care-items')
  listCareItems(@Req() request: AuthRequest) {
    return this.nursingService.listCareItems(request.user)
  }

  @Post('care-items')
  createCareItem(@Req() request: AuthRequest, @Body() body: SaveCareItemDto) {
    return this.nursingService.createCareItem(request.user, body)
  }

  @Patch('care-items/:id')
  updateCareItem(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveCareItemDto
  ) {
    return this.nursingService.updateCareItem(request.user, Number(id), body)
  }

  @Get('care-records')
  listCareRecords(@Req() request: AuthRequest) {
    return this.nursingService.listCareRecords(request.user)
  }

  @Post('care-records')
  createCareRecord(@Req() request: AuthRequest, @Body() body: SaveCareRecordDto) {
    return this.nursingService.createCareRecord(request.user, body)
  }

  @Post('care-records/ai-note')
  generateCareRecordAiNote(
    @Req() request: AuthRequest,
    @Body() body: GenerateCareRecordNoteDto
  ) {
    return this.nursingService.generateCareRecordAiNote(request.user, body)
  }

  @Patch('care-records/:id')
  updateCareRecord(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveCareRecordDto
  ) {
    return this.nursingService.updateCareRecord(request.user, Number(id), body)
  }

  @Delete('care-records/:id')
  deleteCareRecord(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.nursingService.deleteCareRecord(request.user, Number(id))
  }
}
