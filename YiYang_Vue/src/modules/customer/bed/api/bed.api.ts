import { request } from '@/api/request'
import type { BedStatus } from '@/modules/customer/api/shared.types'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'
import type { RoomItem } from './room.api'

export interface BedItem {
  id: number
  roomId: number
  bedNo: string
  label?: string | null
  status: BedStatus
  createdAt?: string
  updatedAt?: string
  room?: RoomItem
  currentResident?: ResidentItem | null
}

export function getBeds() {
  return request<BedItem[]>({
    url: '/api/customer/beds',
  })
}

export function createBed(data: Partial<BedItem>) {
  return request<BedItem>({
    url: '/api/customer/beds',
    method: 'post',
    data,
  })
}

export function updateBed(id: number, data: Partial<BedItem>) {
  return request<BedItem>({
    url: `/api/customer/beds/${id}`,
    method: 'patch',
    data,
  })
}
