import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ServiceAuthModule } from './service-auth.module.js'
import { getAuthServiceTcpConfig } from '../../libs/config/service-config.js'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ServiceAuthModule, {
    transport: Transport.TCP,
    options: getAuthServiceTcpConfig(),
  })

  await app.listen()
}

bootstrap()
