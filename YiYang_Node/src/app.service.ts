import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHealth() {
    return {
      code: 200,
      message: 'YiYang Node service is running',
      timestamp: new Date().toISOString(),
    }
  }
}
