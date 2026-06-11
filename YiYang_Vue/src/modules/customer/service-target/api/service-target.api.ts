import { request } from '@/api/request'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'
import type { UserItem } from '@/modules/customer/user/api/user.api'

export interface ServiceTargetItem {
  id: number
  residentId: number
  managerUserId?: number | null
  managerName: string
  managerMobile: string
  startDate?: string | null
  endDate?: string | null
  relationNote?: string | null
  resident?: ResidentItem
  managerUser?: UserItem | null
}

export function getServiceTargets() {
  return request<ServiceTargetItem[]>({
    url: '/api/customer/service-targets',
  })
}

export function createServiceTarget(data: Partial<ServiceTargetItem>) {
  return request<ServiceTargetItem>({
    url: '/api/customer/service-targets',
    method: 'post',
    data,
  })
}

export function updateServiceTarget(id: number, data: Partial<ServiceTargetItem>) {
  return request<ServiceTargetItem>({
    url: `/api/customer/service-targets/${id}`,
    method: 'patch',
    data,
  })
}
