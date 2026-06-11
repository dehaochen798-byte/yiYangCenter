import { request } from '@/api/request'
import type { CareLevelOption, Gender, ResidenceStatus } from '@/modules/customer/api/shared.types'
import type { BedItem } from '@/modules/customer/bed/api/bed.api'

export interface ResidentItem {
  id: number
  fullName: string
  age: number
  gender: Gender
  phone: string
  idCard?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  status: ResidenceStatus
  note?: string | null
  currentBedId?: number | null
  careLevelId?: number | null
  currentBed?: BedItem | null
  careLevel?: CareLevelOption | null
  createdAt?: string
  updatedAt?: string
}

export function getResidents() {
  return request<ResidentItem[]>({
    url: '/api/customer/residents',
  })
}

export function createResident(data: Partial<ResidentItem>) {
  return request<ResidentItem>({
    url: '/api/customer/residents',
    method: 'post',
    data,
  })
}

export function updateResident(id: number, data: Partial<ResidentItem>) {
  return request<ResidentItem>({
    url: `/api/customer/residents/${id}`,
    method: 'patch',
    data,
  })
}
