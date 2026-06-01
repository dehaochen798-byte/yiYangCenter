import { request } from '@/api/request'
import type { CheckInItem, OutingItem } from '@/modules/customer/api/customer.api'
import type { CareRecordItem } from '@/modules/nursing/api/nursing.api'

export interface DashboardSummary {
  residentCount: number
  activeResidentCount: number
  pendingResidentCount: number
  checkedOutResidentCount: number
  availableBeds: number
  occupiedBeds: number
  disabledBeds: number
  careRecordsToday: number
  activeOutings: number
  activeServices: number
}

export interface DashboardCareLevelStat {
  id: number
  code: string
  name: string
  description?: string | null
  isActive: boolean
  _count: {
    residents: number
    items: number
  }
}

export interface DashboardRoomStat {
  id: number
  building?: string | null
  roomNo: string
  floor: number
  roomType?: string | null
  bedCount: number
  occupiedCount: number
  vacantCount: number
  disabledCount: number
}

export interface DashboardData {
  summary: DashboardSummary
  latestCheckIns: CheckInItem[]
  latestOutings: OutingItem[]
  latestCareRecords: CareRecordItem[]
  careLevelStats: DashboardCareLevelStat[]
  roomStats: DashboardRoomStat[]
}

export function getDashboardSummary() {
  return request<DashboardData>({
    url: '/api/dashboard/summary',
  })
}
