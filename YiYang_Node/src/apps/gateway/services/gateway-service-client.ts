import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy } from '@nestjs/common'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import type { ClientProxy } from '@nestjs/microservices'
import { sendTcpMessage } from '../../../libs/microservices/client-proxy.util.js'
import { LocalRegistryService } from '../../../libs/registry/local-registry.service.js'
import type {
  ServiceInstance,
  ServiceName,
} from '../../../libs/registry/registry.types.js'
import type {
  Actor,
  ActorOnlyPayload,
  ActorIdPayload,
  ActorPayload,
  ActorUpdatePayload,
} from '../../../common/rbac/rbac.types.js'

@Injectable()
export class GatewayServiceClient implements OnModuleDestroy {
  private readonly clients = new Map<string, ClientProxy>()

  constructor(private readonly registry: LocalRegistryService) {}

  async send<TResponse, TPayload>(
    serviceName: ServiceName,
    pattern: unknown,
    payload: TPayload
  ) {
    const client = await this.getClient(serviceName)
    return sendTcpMessage<TResponse, TPayload>(client, pattern, payload)
  }

  withActor<TPayload>(actor: Actor, data: TPayload): ActorPayload<TPayload> {
    return {
      actor,
      data,
    }
  }

  withActorOnly(actor: Actor): ActorOnlyPayload {
    return {
      actor,
    }
  }

  withActorAndId(actor: Actor, id: number): ActorIdPayload {
    return {
      actor,
      id,
    }
  }

  withActorAndUpdate<TPayload>(
    actor: Actor,
    id: number,
    data: TPayload
  ): ActorUpdatePayload<TPayload> {
    return {
      actor,
      id,
      data,
    }
  }

  async getClient(serviceName: ServiceName) {
    const instance = await this.registry.resolve(serviceName)
    const clientKey = this.getClientKey(instance)
    const cachedClient = this.clients.get(clientKey)

    if (cachedClient) {
      return cachedClient
    }

    const client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: instance.host,
        port: instance.port,
      },
    })

    this.clients.set(clientKey, client)
    return client
  }

  async onModuleDestroy() {
    await Promise.all(Array.from(this.clients.values()).map((client) => client.close()))
    this.clients.clear()
  }

  private getClientKey(instance: ServiceInstance) {
    return `${instance.name}:${instance.protocol}:${instance.host}:${instance.port}`
  }
}
