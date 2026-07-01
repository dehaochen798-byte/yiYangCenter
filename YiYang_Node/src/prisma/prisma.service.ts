import { existsSync, readFileSync } from 'node:fs'
import type { SecureContextOptions } from 'node:tls'
import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client.js'
import { LocalEnvConfigCenter } from '../libs/config-center/local-env-config-center.js'
import type { DatabaseConfig } from '../libs/config-center/config-center.types.js'

const DEFAULT_POOL_LIMIT = 10
const configCenter = new LocalEnvConfigCenter()

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

function buildSslConfig(databaseConfig: DatabaseConfig) {
  const rejectUnauthorized = databaseConfig.sslRejectUnauthorized
  const ca = readTlsFile(databaseConfig.sslCaPath)
  const cert = readTlsFile(databaseConfig.sslCertPath)
  const key = readTlsFile(databaseConfig.sslKeyPath)
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

function buildConnectionConfig(databaseConfig: DatabaseConfig, nodeEnv: string) {
  const databaseUrl = databaseConfig.url
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
    config.connectionLimit = databaseConfig.connectionLimit || DEFAULT_POOL_LIMIT
  }

  const sslEnabled = databaseConfig.ssl || config.ssl === true

  if (nodeEnv === 'production' && !sslEnabled) {
    throw new Error(
      'DB_SSL must be enabled in production to avoid plaintext database traffic'
    )
  }

  if (sslEnabled) {
    config.ssl = buildSslConfig(databaseConfig)
  }

  if (databaseConfig.allowPublicKeyRetrieval !== undefined) {
    config.allowPublicKeyRetrieval = databaseConfig.allowPublicKeyRetrieval
  } else if (!sslEnabled && config.allowPublicKeyRetrieval === undefined) {
    config.allowPublicKeyRetrieval = nodeEnv !== 'production'
  }

  return config
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const runtimeConfig = configCenter.getRuntimeConfig()
    const databaseUrl = runtimeConfig.database.url

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined')
    }

    const adapter = new PrismaMariaDb(
      buildConnectionConfig(runtimeConfig.database, runtimeConfig.nodeEnv),
      {
        database: decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, '')),
        onConnectionError: (error) => {
          console.error('Prisma MariaDB connection error:', error.message)
        },
      }
    )

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
