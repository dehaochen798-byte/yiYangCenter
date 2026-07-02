import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/env'

export interface HttpConfig {
  url: string
  method?: string
  data?: unknown
  params?: Record<string, unknown>
  headers?: Record<string, string>
}

function getAuthToken() {
  return localStorage.getItem('auth_token') || ''
}

function resolveErrorMessage(payload: unknown) {
  if (typeof payload === 'string') {
    return payload
  }

  if (Array.isArray(payload)) {
    return payload.join('；')
  }

  if (payload && typeof payload === 'object') {
    const maybeMessage = Reflect.get(payload, 'message')

    if (typeof maybeMessage === 'string') {
      return maybeMessage
    }

    if (Array.isArray(maybeMessage)) {
      return maybeMessage.join('；')
    }
  }

  return '请求失败'
}

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize(params) {
      const searchParams = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return
        }

        searchParams.append(key, String(value))
      })

      return searchParams.toString()
    },
  },
})

httpClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export async function http<T = unknown>(config: HttpConfig) {
  const { url, method = 'GET', data, params, headers = {} } = config
  const requestConfig: AxiosRequestConfig = {
    url,
    method,
    data,
    params,
    headers,
  }

  try {
    const response = await httpClient.request<{
      code: number
      message: string
      data: T
    }>(requestConfig)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const payload = error.response?.data
      const message = resolveErrorMessage(payload?.message ?? payload)
      throw new Error(message)
    }

    throw error
  }
}
