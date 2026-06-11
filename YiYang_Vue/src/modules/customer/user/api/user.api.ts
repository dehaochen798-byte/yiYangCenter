import { request } from '@/api/request'
import type { Gender, UserStatus } from '@/modules/customer/api/shared.types'

export interface UserItem {
  id: number
  mobile: string
  realName: string
  nickName: string
  age: number
  gender: Gender
  status: UserStatus
  roleName?: string | null
  departmentName?: string | null
  createdAt: string
  updatedAt: string
}

export function getUsers() {
  return request<UserItem[]>({
    url: '/api/customer/users',
  })
}

export function createUser(data: Partial<UserItem>) {
  return request<UserItem>({
    url: '/api/customer/users',
    method: 'post',
    data,
  })
}

export function updateUser(id: number, data: Partial<UserItem>) {
  return request<UserItem>({
    url: `/api/customer/users/${id}`,
    method: 'patch',
    data,
  })
}
