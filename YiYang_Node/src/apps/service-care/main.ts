import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ServiceCareModule } from './service-care.module.js'
import { RpcExceptionsFilter } from '../../common/filters/rpc-exceptions.filter.js'
import { getCareServiceTcpConfig } from '../../libs/config/service-config.js'
import { registerServiceInstance } from '../../libs/registry/service-registration.js'
import { SERVICE_NAMES } from '../../libs/registry/registry.types.js'

async function bootstrap() {
  const serviceConfig = getCareServiceTcpConfig()
  const app = await NestFactory.createMicroservice(ServiceCareModule, {
    transport: Transport.TCP,
    options: serviceConfig,
  })

  app.useGlobalFilters(new RpcExceptionsFilter())
  await registerServiceInstance({
    app,
    serviceName: SERVICE_NAMES.care,
    host: serviceConfig.host,
    port: serviceConfig.port,
  })

  await app.listen()
}

bootstrap()
