import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ServiceAuthModule } from './service-auth.module.js'
import { RpcExceptionsFilter } from '../../common/filters/rpc-exceptions.filter.js'
import { getAuthServiceTcpConfig } from '../../libs/config/service-config.js'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ServiceAuthModule, {
    transport: Transport.TCP,
    options: getAuthServiceTcpConfig(),
  })

  app.useGlobalFilters(new RpcExceptionsFilter())

  await app.listen()
}

bootstrap()
