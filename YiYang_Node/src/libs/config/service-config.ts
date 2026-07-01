import { LocalEnvConfigCenter } from '../config-center/local-env-config-center.js'
import { SERVICE_NAMES } from '../registry/registry.types.js'

export type TcpServiceConfig = {
  host: string
  port: number
}

const configCenter = new LocalEnvConfigCenter()

export function getGatewayHttpConfig() {
  return configCenter.getGatewayHttpConfig()
}

export function getAuthServiceTcpConfig(): TcpServiceConfig {
  return configCenter.getServiceConfig(SERVICE_NAMES.auth)
}

export function getCareServiceTcpConfig(): TcpServiceConfig {
  return configCenter.getServiceConfig(SERVICE_NAMES.care)
}
