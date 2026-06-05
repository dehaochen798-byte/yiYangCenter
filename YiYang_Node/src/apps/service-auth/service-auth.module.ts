import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../../config/app.config.js'
import { AuthModule } from '../../modules/auth/auth.module.js'
import { PrismaModule } from '../../prisma/prisma.module.js'
import { AuthMessageController } from './transport/auth-message.controller.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AuthMessageController],
})
export class ServiceAuthModule {}
