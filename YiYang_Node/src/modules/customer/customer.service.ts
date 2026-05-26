import { Injectable } from '@nestjs/common'

@Injectable()
export class CustomerService {
  getModules() {
    return {
      code: 200,
      message: '客户管理模块可用',
      data: [
        'bed',
        'meal',
        'meal-calendar',
        'check-in',
        'check-out',
        'outing',
        'service-target',
        'service-focus',
        'user',
      ],
    }
  }
}
