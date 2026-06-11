import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import * as classTransformer from 'class-transformer'
import * as classValidator from 'class-validator'
import { GatewayModule } from './gateway.module.js'
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter.js'
import { getGatewayHttpConfig } from '../../libs/config/service-config.js'

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, new ExpressAdapter())

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      validatorPackage: classValidator,
      transformerPackage: classTransformer,
    })
  )
  app.useGlobalFilters(app.get(AllExceptionsFilter))

  await app.listen(getGatewayHttpConfig().port)
}

bootstrap()
