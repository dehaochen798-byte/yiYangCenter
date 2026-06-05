import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { GatewayModule } from './gateway.module.js'
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter.js'
import { getGatewayHttpConfig } from '../../libs/config/service-config.js'

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule)

  app.setGlobalPrefix('api')
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  )
  app.useGlobalFilters(app.get(AllExceptionsFilter))

  await app.listen(getGatewayHttpConfig().port)
}

bootstrap()
