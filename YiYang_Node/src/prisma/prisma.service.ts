import { existsSync, readFileSync } from 'node:fs'
import type { SecureContextOptions } from 'node:tls'
import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client.js'

const DEFAULT_POOL_LIMIT = 10

function isTruthy(value: string | undefined) {
  return value === 'true' || value === '1'
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function parseQueryValue(value: string) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (/^-?\d+$/.test(value)) {
    return Number(value)
  }

  return value
}

function readTlsFile(filePath: string | undefined) {
  if (!filePath) {
    return undefined
  }

  if (!existsSync(filePath)) {
    throw new Error(`TLS file does not exist: ${filePath}`)
  }

  return readFileSync(filePath, 'utf8')
}

function buildSslConfig() {
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED
    ? isTruthy(process.env.DB_SSL_REJECT_UNAUTHORIZED)
    : true

  const ca = readTlsFile(process.env.DB_SSL_CA_PATH)
  const cert = readTlsFile(process.env.DB_SSL_CERT_PATH)
  const key = readTlsFile(process.env.DB_SSL_KEY_PATH)
  const hasCustomTlsMaterial = Boolean(ca || cert || key)

  if (!hasCustomTlsMaterial && rejectUnauthorized) {
    return true
  }

  const sslConfig: SecureContextOptions & { rejectUnauthorized?: boolean } = {
    rejectUnauthorized,
  }

  if (ca) {
    sslConfig.ca = ca
  }

  if (cert) {
    sslConfig.cert = cert
  }

  if (key) {
    sslConfig.key = key
  }

  return sslConfig
}

function buildConnectionConfig(databaseUrl: string) {
  const connectionUrl = new URL(databaseUrl)
  const config: Record<string, unknown> = {}

  for (const [key, value] of connectionUrl.searchParams.entries()) {
    config[key] = parseQueryValue(value)
  }

  config.host = decodeURIComponent(connectionUrl.hostname)
  config.port = Number(connectionUrl.port || 3306)
  config.user = decodeURIComponent(connectionUrl.username)
  config.password = decodeURIComponent(connectionUrl.password)
  config.database = decodeURIComponent(connectionUrl.pathname.replace(/^\//, ''))

  if (config.connectionLimit === undefined) {
    config.connectionLimit = parsePositiveInt(
      process.env.DB_CONNECTION_LIMIT,
      DEFAULT_POOL_LIMIT
    )
  }

  const sslEnabled = isTruthy(process.env.DB_SSL) || config.ssl === true

  if (process.env.NODE_ENV === 'production' && !sslEnabled) {
    throw new Error('DB_SSL must be enabled in production to avoid plaintext database traffic')
  }

  if (sslEnabled) {
    config.ssl = buildSslConfig()
  }

  const allowPublicKeyRetrieval = process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL

  if (allowPublicKeyRetrieval !== undefined) {
    config.allowPublicKeyRetrieval = isTruthy(allowPublicKeyRetrieval)
  } else if (!sslEnabled && config.allowPublicKeyRetrieval === undefined) {
    config.allowPublicKeyRetrieval = process.env.NODE_ENV !== 'production'
  }

  return config
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined')
    }

    const adapter = new PrismaMariaDb(buildConnectionConfig(databaseUrl), {
      database: decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, '')),
      onConnectionError: (error) => {
        console.error('Prisma MariaDB connection error:', error.message)
      },
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
