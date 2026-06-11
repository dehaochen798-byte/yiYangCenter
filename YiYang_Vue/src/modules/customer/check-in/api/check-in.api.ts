import { request } from '@/api/request'
import type { BedItem } from '@/modules/customer/bed/api/bed.api'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'

export interface CheckInItem {
  id: number
  residentId: number
  bedId: number
  checkInAt: string
  note?: string | null
  resident?: ResidentItem
  bed?: BedItem
}

export function getCheckIns() {
  return request<CheckInItem[]>({
    url: '/api/customer/check-ins',
  })
}

export function createCheckIn(data: Partial<CheckInItem>) {
  return request<CheckInItem>({
    url: '/api/customer/check-ins',
    method: 'post',
    data,
  })
}
