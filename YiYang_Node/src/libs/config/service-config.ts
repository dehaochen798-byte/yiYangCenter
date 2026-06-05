export type TcpServiceConfig = {
  host: string
  port: number
}

function toPort(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function getGatewayHttpConfig() {
  return {
    port: toPort(process.env.GATEWAY_PORT ?? process.env.PORT, 3000),
  }
}

export function getAuthServiceTcpConfig(): TcpServiceConfig {
  return {
    host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
    port: toPort(process.env.AUTH_SERVICE_PORT, 4010),
  }
}

export function getCareServiceTcpConfig(): TcpServiceConfig {
  return {
    host: process.env.CARE_SERVICE_HOST || '127.0.0.1',
    port: toPort(process.env.CARE_SERVICE_PORT, 4020),
  }
}
