import type {
  ConfigCenter,
  DatabaseConfig,
  GatewayHttpConfig,
  JwtConfig,
  MessageBrokerConfig,
  RuntimeConfig,
} from './config-center.types.js'
import type { TcpServiceConfig } from '../config/service-config.js'
import { SERVICE_NAMES, type ServiceName } from '../registry/registry.types.js'

function toPort(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function toBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback
  }

  return value === 'true' || value === '1'
}

export class LocalEnvConfigCenter implements ConfigCenter {
  getRuntimeConfig(): RuntimeConfig {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      gateway: this.getGatewayHttpConfig(),
      services: {
        [SERVICE_NAMES.auth]: this.getServiceConfig(SERVICE_NAMES.auth),
        [SERVICE_NAMES.care]: this.getServiceConfig(SERVICE_NAMES.care),
      },
      database: this.getDatabaseConfig(),
      jwt: this.getJwtConfig(),
      messageBroker: this.getMessageBrokerConfig(),
    }
  }

  getGatewayHttpConfig(): GatewayHttpConfig {
    return {
      port: toPort(process.env.GATEWAY_PORT ?? process.env.PORT, 3000),
    }
  }

  getServiceConfig(serviceName: ServiceName): TcpServiceConfig {
    if (serviceName === SERVICE_NAMES.auth) {
      return {
        host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
        port: toPort(process.env.AUTH_SERVICE_PORT, 4010),
      }
    }

    return {
      host: process.env.CARE_SERVICE_HOST || '127.0.0.1',
      port: toPort(process.env.CARE_SERVICE_PORT, 4020),
    }
  }

  getDatabaseConfig(): DatabaseConfig {
    return {
      url: process.env.DATABASE_URL || '',
      connectionLimit: toPositiveInt(process.env.DB_CONNECTION_LIMIT, 10),
      ssl: toBool(process.env.DB_SSL, false),
      sslRejectUnauthorized: toBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
      sslCaPath: process.env.DB_SSL_CA_PATH || '',
      sslCertPath: process.env.DB_SSL_CERT_PATH || '',
      sslKeyPath: process.env.DB_SSL_KEY_PATH || '',
      allowPublicKeyRetrieval:
        process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL === undefined
          ? undefined
          : toBool(process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL, true),
    }
  }

  getJwtConfig(): JwtConfig {
    return {
      secret: process.env.JWT_SECRET || 'change-this-secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  }

  getMessageBrokerConfig(): MessageBrokerConfig {
    return {
      redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      streamKey: process.env.MESSAGE_STREAM_KEY || 'yiyang:domain-events',
    }
  }
}
