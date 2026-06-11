import { request } from '@/api/request'
import type { OutingStatus } from '@/modules/customer/api/shared.types'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'

export interface OutingItem {
  id: number
  residentId: number
  startAt: string
  expectedReturnAt?: string | null
  actualReturnAt?: string | null
  destination?: string | null
  reason?: string | null
  status: OutingStatus
  resident?: ResidentItem
}

export function getOutings() {
  return request<OutingItem[]>({
    url: '/api/customer/outings',
  })
}

export function createOuting(data: Partial<OutingItem>) {
  return request<OutingItem>({
    url: '/api/customer/outings',
    method: 'post',
    data,
  })
}

export function returnOuting(id: number, data: { actualReturnAt: string }) {
  return request<OutingItem>({
    url: `/api/customer/outings/${id}/return`,
    method: 'patch',
    data,
  })
}
