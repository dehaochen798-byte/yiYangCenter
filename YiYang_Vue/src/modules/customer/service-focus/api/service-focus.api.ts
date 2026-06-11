import { request } from '@/api/request'
import type { ServiceFocusStatus } from '@/modules/customer/api/shared.types'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'

export interface ServiceFocusItem {
  id: number
  residentId: number
  serviceName: string
  detail?: string | null
  serviceStartAt?: string | null
  serviceEndAt?: string | null
  status: ServiceFocusStatus
  resident?: ResidentItem
}

export function getServiceFocuses() {
  return request<ServiceFocusItem[]>({
    url: '/api/customer/service-focuses',
  })
}

export function createServiceFocus(data: Partial<ServiceFocusItem>) {
  return request<ServiceFocusItem>({
    url: '/api/customer/service-focuses',
    method: 'post',
    data,
  })
}

export function updateServiceFocus(id: number, data: Partial<ServiceFocusItem>) {
  return request<ServiceFocusItem>({
    url: `/api/customer/service-focuses/${id}`,
    method: 'patch',
    data,
  })
}
