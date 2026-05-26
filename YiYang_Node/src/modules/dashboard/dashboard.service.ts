import { Injectable } from '@nestjs/common'

@Injectable()
export class DashboardService {
  getSummary() {
    return {
      code: 200,
      message: '获取工作台统计成功',
      data: {
        residents: 0,
        availableBeds: 0,
        careRecordsToday: 0,
        pendingOutings: 0,
      },
    }
  }
}
