import { Injectable } from '@nestjs/common'

@Injectable()
export class NursingService {
  getModules() {
    return {
      code: 200,
      message: '护理模块可用',
      data: ['care-level', 'care-item', 'care-record'],
    }
  }
}
