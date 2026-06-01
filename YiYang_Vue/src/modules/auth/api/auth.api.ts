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
  gender: 'MALE' | 'FEMALE'
}

export interface AuthProfile {
  id: number
  mobile: string
  realName: string
  nickName: string
  age: number
  gender: 'MALE' | 'FEMALE'
}

export interface LoginResponse {
  token: string
  profile: AuthProfile
}

export interface RegisterResponse {
  id: number
  mobile: string
  realName: string
  nickName: string
  age: number
  gender: 'MALE' | 'FEMALE'
}

export function loginApi(data: LoginPayload) {
  return request<LoginResponse>({
    url: '/api/auth/login',
    method: 'post',
    data,
  })
}

export function registerApi(data: RegisterPayload) {
  return request<RegisterResponse>({
    url: '/api/auth/register',
    method: 'post',
    data,
  })
}
