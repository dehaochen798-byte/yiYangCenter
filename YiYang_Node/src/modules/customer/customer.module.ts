import { Module } from '@nestjs/common'
import { MessageBrokerModule } from '../../libs/message-broker/message-broker.module.js'
import { CustomerController } from './customer.controller.js'
import { CustomerService } from './customer.service.js'

@Module({
  imports: [MessageBrokerModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
