export interface HttpConfig {
  url: string
  method?: string
  data?: unknown
  params?: Record<string, unknown>
  headers?: Record<string, string>
}

function buildUrl(url: string, params?: Record<string, unknown>) {
  if (!params || Object.keys(params).length === 0) {
    return url
  }

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    searchParams.append(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `${url}?${query}` : url
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

export async function http<T = unknown>(config: HttpConfig) {
  const { url, method = 'GET', data, params, headers = {} } = config
  const requestUrl = buildUrl(url, params)
  const token = getAuthToken()

  const response = await fetch(requestUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = resolveErrorMessage(payload?.message ?? payload)
    throw new Error(message)
  }

  return payload as {
    code: number
    message: string
    data: T
  }
}
