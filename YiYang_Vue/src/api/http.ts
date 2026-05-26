export interface HttpConfig {
  url: string
  method?: string
  data?: unknown
  params?: Record<string, unknown>
}

export async function http(config: HttpConfig) {
  return Promise.resolve({
    code: 200,
    message: 'mock success',
    data: config,
  })
}
