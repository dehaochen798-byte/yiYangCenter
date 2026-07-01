import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '../../app.controller.js'
import { AppService } from '../../app.service.js'
import appConfig from '../../config/app.config.js'
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter.js'
import { AuthController } from './http/auth.controller.js'
import { CustomerController } from './http/customer.controller.js'
import { DashboardController } from './http/dashboard.controller.js'
import { NursingController } from './http/nursing.controller.js'
import { GatewayJwtGuard } from './security/gateway-jwt.guard.js'
import { GatewayAuthService } from './services/gateway-auth.service.js'
import { GatewayServiceClient } from './services/gateway-service-client.js'
import { LocalRegistryService } from '../../libs/registry/local-registry.service.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    CustomerController,
    DashboardController,
    NursingController,
  ],
  providers: [
    AppService,
    AllExceptionsFilter,
    GatewayJwtGuard,
    GatewayAuthService,
    GatewayServiceClient,
    LocalRegistryService,
  ],
})
export class GatewayModule {}
