import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ServiceAuthModule } from './service-auth.module.js'
import { RpcExceptionsFilter } from '../../common/filters/rpc-exceptions.filter.js'
import { getAuthServiceTcpConfig } from '../../libs/config/service-config.js'
import { registerServiceInstance } from '../../libs/registry/service-registration.js'
import { SERVICE_NAMES } from '../../libs/registry/registry.types.js'

async function bootstrap() {
  const serviceConfig = getAuthServiceTcpConfig()
  const app = await NestFactory.createMicroservice(ServiceAuthModule, {
    transport: Transport.TCP,
    options: serviceConfig,
  })

  app.useGlobalFilters(new RpcExceptionsFilter())
  await registerServiceInstance({
    app,
    serviceName: SERVICE_NAMES.auth,
    host: serviceConfig.host,
    port: serviceConfig.port,
  })

  await app.listen()
}

bootstrap()
