import { Module } from '@nestjs/common'
import { NursingController } from './nursing.controller.js'
import { NursingService } from './nursing.service.js'

@Module({
  controllers: [NursingController],
  providers: [NursingService],
  exports: [NursingService],
})
export class NursingModule {}
