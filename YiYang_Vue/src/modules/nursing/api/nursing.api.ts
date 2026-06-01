import { request } from '@/api/request'
import type { ResidentItem, UserItem } from '@/modules/customer/api/customer.api'

export interface CareLevelItem {
  id: number
  code: string
  name: string
  description?: string | null
  isActive: boolean
  _count?: {
    items: number
    residents: number
  }
}

export interface CareItemItem {
  id: number
  careLevelId: number
  name: string
  description?: string | null
  frequency?: string | null
  durationMinutes?: number | null
  instructions?: string | null
  isActive: boolean
  careLevel?: CareLevelItem
  _count?: {
    records: number
  }
}

export interface CareRecordItem {
  id: number
  residentId: number
  careItemId: number
  operatorId: number
  executedAt: string
  note?: string | null
  resident?: ResidentItem
  careItem?: CareItemItem
  operator?: Pick<UserItem, 'id' | 'realName' | 'mobile' | 'roleName'>
}

export function getCareLevels() {
  return request<CareLevelItem[]>({
    url: '/api/nursing/care-levels',
  })
}

export function createCareLevel(data: Partial<CareLevelItem>) {
  return request<CareLevelItem>({
    url: '/api/nursing/care-levels',
    method: 'post',
    data,
  })
}

export function updateCareLevel(id: number, data: Partial<CareLevelItem>) {
  return request<CareLevelItem>({
    url: `/api/nursing/care-levels/${id}`,
    method: 'patch',
    data,
  })
}

export function getCareItems() {
  return request<CareItemItem[]>({
    url: '/api/nursing/care-items',
  })
}

export function createCareItem(data: Partial<CareItemItem>) {
  return request<CareItemItem>({
    url: '/api/nursing/care-items',
    method: 'post',
    data,
  })
}

export function updateCareItem(id: number, data: Partial<CareItemItem>) {
  return request<CareItemItem>({
    url: `/api/nursing/care-items/${id}`,
    method: 'patch',
    data,
  })
}

export function getCareRecords() {
  return request<CareRecordItem[]>({
    url: '/api/nursing/care-records',
  })
}

export function createCareRecord(data: Partial<CareRecordItem>) {
  return request<CareRecordItem>({
    url: '/api/nursing/care-records',
    method: 'post',
    data,
  })
}

export function updateCareRecord(id: number, data: Partial<CareRecordItem>) {
  return request<CareRecordItem>({
    url: `/api/nursing/care-records/${id}`,
    method: 'patch',
    data,
  })
}
