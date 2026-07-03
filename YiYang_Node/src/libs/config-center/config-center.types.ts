import type { TcpServiceConfig } from '../config/service-config.js'
import type { ServiceName } from '../registry/registry.types.js'

export type GatewayHttpConfig = {
  port: number
}

export type DatabaseConfig = {
  url: string
  connectionLimit: number
  ssl: boolean
  sslRejectUnauthorized: boolean
  sslCaPath: string
  sslCertPath: string
  sslKeyPath: string
  allowPublicKeyRetrieval?: boolean
}

export type JwtConfig = {
  secret: string
  expiresIn: string
}

export type MessageBrokerConfig = {
  redisUrl: string
  streamKey: string
}

export type AiProviderConfig = {
  apiKey: string
  baseUrl: string
  model: string
}

export type RuntimeConfig = {
  nodeEnv: string
  gateway: GatewayHttpConfig
  services: Record<ServiceName, TcpServiceConfig>
  database: DatabaseConfig
  jwt: JwtConfig
  messageBroker: MessageBrokerConfig
  ai: AiProviderConfig
}

export interface ConfigCenter {
  getRuntimeConfig(): RuntimeConfig
  getGatewayHttpConfig(): GatewayHttpConfig
  getServiceConfig(serviceName: ServiceName): TcpServiceConfig
  getDatabaseConfig(): DatabaseConfig
  getJwtConfig(): JwtConfig
  getMessageBrokerConfig(): MessageBrokerConfig
  getAiProviderConfig(): AiProviderConfig
}
