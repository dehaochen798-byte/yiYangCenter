import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { LocalEnvConfigCenter } from '../config-center/local-env-config-center.js'
import {
  SERVICE_NAMES,
  type RegistryService,
  type ServiceInstance,
  type ServiceName,
} from './registry.types.js'

type RegistryFile = {
  instances: ServiceInstance[]
}

@Injectable()
export class LocalRegistryService implements RegistryService {
  private readonly registeredInstances = new Map<string, ServiceInstance>()
  private readonly configCenter = new LocalEnvConfigCenter()
  private readonly registryFilePath =
    process.env.LOCAL_REGISTRY_FILE || join(tmpdir(), 'yiyang-node-local-registry.json')

  async register(instance: ServiceInstance) {
    this.registeredInstances.set(instance.id, instance)
    this.writeInstances([
      ...this.readInstances().filter((item) => item.id !== instance.id),
      instance,
    ])
    console.log(
      `[registry] registered ${instance.name} ${instance.host}:${instance.port}`
    )
  }

  async deregister(instanceId: string) {
    const instance = this.registeredInstances.get(instanceId)
    this.registeredInstances.delete(instanceId)
    this.writeInstances(this.readInstances().filter((item) => item.id !== instanceId))

    if (instance) {
      console.log(
        `[registry] deregistered ${instance.name} ${instance.host}:${instance.port}`
      )
    }
  }

  async discover(serviceName: ServiceName) {
    const registeredInstances = [
      ...this.readInstances(),
      ...Array.from(this.registeredInstances.values()),
    ]
    const localInstances = registeredInstances.filter(
      (instance) => instance.name === serviceName
    )

    if (localInstances.length) {
      return localInstances
    }

    return [this.buildConfiguredInstance(serviceName)]
  }

  async resolve(serviceName: ServiceName) {
    const [instance] = await this.discover(serviceName)

    if (!instance) {
      throw new ServiceUnavailableException(`${serviceName} is unavailable`)
    }

    return instance
  }

  private buildConfiguredInstance(serviceName: ServiceName): ServiceInstance {
    const config = this.configCenter.getServiceConfig(serviceName)
    const serviceKey =
      serviceName === SERVICE_NAMES.auth ? 'service-auth' : 'service-care'

    return {
      id: `${serviceKey}-${config.host}-${config.port}`,
      name: serviceName,
      host: config.host,
      port: config.port,
      protocol: 'tcp',
      metadata: {
        source: 'local-env',
      },
    }
  }

  private readInstances() {
    if (!existsSync(this.registryFilePath)) {
      return []
    }

    try {
      const registry = JSON.parse(
        readFileSync(this.registryFilePath, 'utf8')
      ) as RegistryFile
      return Array.isArray(registry.instances) ? registry.instances : []
    } catch {
      return []
    }
  }

  private writeInstances(instances: ServiceInstance[]) {
    mkdirSync(dirname(this.registryFilePath), { recursive: true })
    writeFileSync(this.registryFilePath, JSON.stringify({ instances }, null, 2))
  }
}
