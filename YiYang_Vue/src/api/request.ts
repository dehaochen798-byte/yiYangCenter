import { http, type HttpConfig } from './http'

export function request<T = unknown>(config: HttpConfig) {
  return http<T>(config)
}
