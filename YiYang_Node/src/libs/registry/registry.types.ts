export const SERVICE_NAMES = {
  auth: 'AUTH_SERVICE',
  care: 'CARE_SERVICE',
} as const

export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES]

export type ServiceInstance = {
  id: string
  name: ServiceName
  host: string
  port: number
  protocol: 'tcp'
  metadata?: Record<string, string>
}

export interface RegistryService {
  register(instance: ServiceInstance): Promise<void>
  deregister(instanceId: string): Promise<void>
  discover(serviceName: ServiceName): Promise<ServiceInstance[]>
  resolve(serviceName: ServiceName): Promise<ServiceInstance>
}
