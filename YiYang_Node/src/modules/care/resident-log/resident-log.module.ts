import { Module } from '@nestjs/common'
import { ResidentLogController } from './resident-log.controller.js'
import { ResidentLogService } from './resident-log.service.js'

@Module({
  controllers: [ResidentLogController],
  providers: [ResidentLogService],
  exports: [ResidentLogService],
})
export class ResidentLogModule {}
