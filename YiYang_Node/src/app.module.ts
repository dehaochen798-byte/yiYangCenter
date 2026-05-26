import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { NursingModule } from './modules/nursing/nursing.module'
import { PrismaModule } from './prisma/prisma.module'
import { SystemModule } from './modules/system/system.module'
import { CustomerModule } from './modules/customer/customer.module'
import appConfig from './config/app.config'

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
