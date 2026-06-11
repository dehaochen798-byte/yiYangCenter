import { request } from '@/api/request'
import type { BedItem } from './bed.api'

export interface RoomItem {
  id: number
  building?: string | null
  roomNo: string
  floor: number
  roomType?: string | null
  bedCount: number
  description?: string | null
  isActive: boolean
  beds?: BedItem[]
}

export function getRooms() {
  return request<RoomItem[]>({
    url: '/api/customer/rooms',
  })
}

export function createRoom(data: Partial<RoomItem>) {
  return request<RoomItem>({
    url: '/api/customer/rooms',
    method: 'post',
    data,
  })
}

export function updateRoom(id: number, data: Partial<RoomItem>) {
  return request<RoomItem>({
    url: `/api/customer/rooms/${id}`,
    method: 'patch',
    data,
  })
}
