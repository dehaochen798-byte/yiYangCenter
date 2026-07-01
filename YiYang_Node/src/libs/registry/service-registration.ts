import type { INestMicroservice } from '@nestjs/common'
import { LocalRegistryService } from './local-registry.service.js'
import type { ServiceInstance, ServiceName } from './registry.types.js'

type RegisterServiceOptions = {
  app: INestMicroservice
  serviceName: ServiceName
  host: string
  port: number
}

export async function registerServiceInstance(options: RegisterServiceOptions) {
  const registry = new LocalRegistryService()
  const instance: ServiceInstance = {
    id: `${options.serviceName}-${options.host}-${options.port}-${process.pid}`,
    name: options.serviceName,
    host: options.host,
    port: options.port,
    protocol: 'tcp',
    metadata: {
      pid: String(process.pid),
      source: 'service-bootstrap',
    },
  }

  await registry.register(instance)

  const deregister = async () => {
    await registry.deregister(instance.id)
  }

  options.app.enableShutdownHooks()
  process.once('SIGINT', deregister)
  process.once('SIGTERM', deregister)
  process.once('beforeExit', deregister)
}
