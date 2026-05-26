import { request } from '@/api/request'

export interface LoginPayload {
  mobile: string
  password: string
}

export interface RegisterPayload {
  mobile: string
  password: string
  realName: string
  age: number
  gender: '男' | '女'
}

export function loginApi(data: LoginPayload) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

export function registerApi(data: RegisterPayload) {
  return request({
    url: '/auth/register',
    method: 'post',
    data,
  })
}
