import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../../config/app.config.js'
import { PrismaModule } from '../../prisma/prisma.module.js'
import { DashboardModule } from '../../modules/dashboard/dashboard.module.js'
import { CustomerModule } from '../../modules/customer/customer.module.js'
import { NursingModule } from '../../modules/nursing/nursing.module.js'
import { CareMessageController } from './transport/care-message.controller.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    DashboardModule,
    CustomerModule,
    NursingModule,
  ],
  controllers: [CareMessageController],
})
export class ServiceCareModule {}
