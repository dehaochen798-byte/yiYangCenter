import { Injectable } from '@nestjs/common'

@Injectable()
export class SystemService {
  ping() {
    return {
      code: 200,
      message: 'pong',
    }
  }
}
