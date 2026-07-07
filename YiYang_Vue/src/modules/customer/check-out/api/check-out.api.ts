import { request } from '@/api/request'
import type { BedItem } from '@/modules/customer/bed/api/bed.api'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'

export interface CheckOutItem {
  id: number
  residentId: number
  bedId?: number | null
  checkOutAt: string
  reason?: string | null
  handoverNote?: string | null
  resident?: ResidentItem
  bed?: BedItem | null
}

export function getCheckOuts() {
  return request<CheckOutItem[]>({
    url: '/api/customer/check-outs',
  })
}

export function createCheckOut(data: Partial<CheckOutItem>) {
  return request<CheckOutItem>({
    url: '/api/customer/check-outs',
    method: 'post',
    data,
  })
}

export function deleteCheckOut(id: number) {
  return request<void>({
    url: `/api/customer/check-outs/${id}`,
    method: 'delete',
  })
}
