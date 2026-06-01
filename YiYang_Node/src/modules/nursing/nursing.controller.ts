import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { NursingService } from './nursing.service.js'

@Controller('nursing')
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
  createCareLevel(@Body() body: Record<string, unknown>) {
    return this.nursingService.createCareLevel(body as never)
  }

  @Patch('care-levels/:id')
  updateCareLevel(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.nursingService.updateCareLevel(Number(id), body as never)
  }

  @Get('care-items')
  listCareItems() {
    return this.nursingService.listCareItems()
  }

  @Post('care-items')
  createCareItem(@Body() body: Record<string, unknown>) {
    return this.nursingService.createCareItem(body as never)
  }

  @Patch('care-items/:id')
  updateCareItem(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.nursingService.updateCareItem(Number(id), body as never)
  }

  @Get('care-records')
  listCareRecords() {
    return this.nursingService.listCareRecords()
  }

  @Post('care-records')
  createCareRecord(@Body() body: Record<string, unknown>) {
    return this.nursingService.createCareRecord(body as never)
  }

  @Patch('care-records/:id')
  updateCareRecord(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.nursingService.updateCareRecord(Number(id), body as never)
  }
}
