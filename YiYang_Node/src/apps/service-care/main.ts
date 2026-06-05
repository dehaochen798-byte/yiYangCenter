import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ServiceCareModule } from './service-care.module.js'
import { getCareServiceTcpConfig } from '../../libs/config/service-config.js'

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ServiceCareModule, {
    transport: Transport.TCP,
    options: getCareServiceTcpConfig(),
  })

  await app.listen()
}

bootstrap()
