import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import appConfig from './config/app.config.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { CustomerModule } from './modules/customer/customer.module.js'
import { DashboardModule } from './modules/dashboard/dashboard.module.js'
import { NursingModule } from './modules/nursing/nursing.module.js'
import { SystemModule } from './modules/system/system.module.js'
import { PrismaModule } from './prisma/prisma.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    CustomerModule,
    NursingModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
