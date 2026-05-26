import { Controller, Get } from '@nestjs/common'
import { NursingService } from './nursing.service'

@Controller('nursing')
export class NursingController {
  constructor(private readonly nursingService: NursingService) {}

  @Get('modules')
  getModules() {
    return this.nursingService.getModules()
  }
}
