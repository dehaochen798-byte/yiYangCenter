import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { LocalEnvConfigCenter } from '../src/libs/config-center/local-env-config-center.js'
import { SERVICE_NAMES } from '../src/libs/registry/registry.types.js'

const managedEnvKeys = [
  'PORT',
  'GATEWAY_PORT',
  'AUTH_SERVICE_HOST',
  'AUTH_SERVICE_PORT',
  'CARE_SERVICE_HOST',
  'CARE_SERVICE_PORT',
  'DATABASE_URL',
  'DB_CONNECTION_LIMIT',
  'DB_SSL',
  'DB_SSL_REJECT_UNAUTHORIZED',
  'DB_ALLOW_PUBLIC_KEY_RETRIEVAL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
]

const originalEnv = new Map<string, string | undefined>()

for (const key of managedEnvKeys) {
  originalEnv.set(key, process.env[key])
}

afterEach(() => {
  for (const key of managedEnvKeys) {
    const value = originalEnv.get(key)

    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

describe('LocalEnvConfigCenter', () => {
  it('reads gateway, service, database, and jwt config from environment', () => {
    process.env.GATEWAY_PORT = '3100'
    process.env.AUTH_SERVICE_HOST = '10.0.0.11'
    process.env.AUTH_SERVICE_PORT = '4110'
    process.env.CARE_SERVICE_HOST = '10.0.0.12'
    process.env.CARE_SERVICE_PORT = '4220'
    process.env.DATABASE_URL = 'mysql://root:1111@localhost:3306/yiyang_center'
    process.env.DB_CONNECTION_LIMIT = '12'
    process.env.DB_SSL = '1'
    process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false'
    process.env.JWT_SECRET = 'test-secret'
    process.env.JWT_EXPIRES_IN = '1d'

    const configCenter = new LocalEnvConfigCenter()
    const runtimeConfig = configCenter.getRuntimeConfig()

    assert.equal(runtimeConfig.gateway.port, 3100)
    assert.deepEqual(runtimeConfig.services[SERVICE_NAMES.auth], {
      host: '10.0.0.11',
      port: 4110,
    })
    assert.deepEqual(runtimeConfig.services[SERVICE_NAMES.care], {
      host: '10.0.0.12',
      port: 4220,
    })
    assert.equal(
      runtimeConfig.database.url,
      'mysql://root:1111@localhost:3306/yiyang_center'
    )
    assert.equal(runtimeConfig.database.connectionLimit, 12)
    assert.equal(runtimeConfig.database.ssl, true)
    assert.equal(runtimeConfig.database.sslRejectUnauthorized, false)
    assert.equal(runtimeConfig.jwt.secret, 'test-secret')
    assert.equal(runtimeConfig.jwt.expiresIn, '1d')
  })

  it('falls back to local defaults for service discovery config', () => {
    delete process.env.AUTH_SERVICE_HOST
    delete process.env.AUTH_SERVICE_PORT
    delete process.env.CARE_SERVICE_HOST
    delete process.env.CARE_SERVICE_PORT

    const configCenter = new LocalEnvConfigCenter()

    assert.deepEqual(configCenter.getServiceConfig(SERVICE_NAMES.auth), {
      host: '127.0.0.1',
      port: 4010,
    })
    assert.deepEqual(configCenter.getServiceConfig(SERVICE_NAMES.care), {
      host: '127.0.0.1',
      port: 4020,
    })
  })
})
