import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import {
  GenerateCareRecordNoteDto,
  SaveCareItemDto,
  SaveCareLevelDto,
  SaveCareRecordDto,
} from './dto/nursing.dto.js'
import { NursingService } from './nursing.service.js'

@Controller('nursing')
@UseGuards(JwtAuthGuard)
export class NursingController {
  constructor(private readonly nursingService: NursingService) {}

  @Get('modules')
  getModules() {
    return this.nursingService.getModules()
  }

  @Get('care-levels')
  listCareLevels() {
    return this.nursingService.listCareLevels()
  }

  @Post('care-levels')
  createCareLevel(@Body() body: SaveCareLevelDto) {
    return this.nursingService.createCareLevel(body)
  }

  @Patch('care-levels/:id')
  updateCareLevel(@Param('id') id: string, @Body() body: SaveCareLevelDto) {
    return this.nursingService.updateCareLevel(Number(id), body)
  }

  @Get('care-items')
  listCareItems() {
    return this.nursingService.listCareItems()
  }

  @Post('care-items')
  createCareItem(@Body() body: SaveCareItemDto) {
    return this.nursingService.createCareItem(body)
  }

  @Patch('care-items/:id')
  updateCareItem(@Param('id') id: string, @Body() body: SaveCareItemDto) {
    return this.nursingService.updateCareItem(Number(id), body)
  }

  @Get('care-records')
  listCareRecords() {
    return this.nursingService.listCareRecords()
  }

  @Post('care-records')
  createCareRecord(@Body() body: SaveCareRecordDto) {
    return this.nursingService.createCareRecord(body)
  }

  @Post('care-records/ai-note')
  generateCareRecordAiNote(@Body() body: GenerateCareRecordNoteDto) {
    return this.nursingService.generateCareRecordAiNote(body)
  }

  @Patch('care-records/:id')
  updateCareRecord(@Param('id') id: string, @Body() body: SaveCareRecordDto) {
    return this.nursingService.updateCareRecord(Number(id), body)
  }
}
