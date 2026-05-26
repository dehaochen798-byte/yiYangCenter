import { http, type HttpConfig } from './http'

export function request(config: HttpConfig) {
  return http(config)
}
