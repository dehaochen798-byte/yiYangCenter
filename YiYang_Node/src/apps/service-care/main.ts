import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ServiceCareModule } from './service-care.module.js'
import { RpcExceptionsFilter } from '../../common/filters/rpc-exceptions.filter.js'
import { getCareServiceTcpConfig } from '../../libs/config/service-config.js'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ServiceCareModule, {
    transport: Transport.TCP,
    options: getCareServiceTcpConfig(),
  })

  app.useGlobalFilters(new RpcExceptionsFilter())

  await app.listen()
}

bootstrap()
