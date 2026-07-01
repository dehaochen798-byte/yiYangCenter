import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { after, afterEach, describe, it } from 'node:test'
import { LocalRegistryService } from '../src/libs/registry/local-registry.service.js'
import { SERVICE_NAMES } from '../src/libs/registry/registry.types.js'

const originalAuthHost = process.env.AUTH_SERVICE_HOST
const originalAuthPort = process.env.AUTH_SERVICE_PORT
const originalRegistryFile = process.env.LOCAL_REGISTRY_FILE
const testRegistryFile = join(tmpdir(), `yiyang-node-registry-test-${process.pid}.json`)

process.env.LOCAL_REGISTRY_FILE = testRegistryFile

afterEach(() => {
  rmSync(testRegistryFile, { force: true })

  if (originalAuthHost === undefined) {
    delete process.env.AUTH_SERVICE_HOST
  } else {
    process.env.AUTH_SERVICE_HOST = originalAuthHost
  }

  if (originalAuthPort === undefined) {
    delete process.env.AUTH_SERVICE_PORT
  } else {
    process.env.AUTH_SERVICE_PORT = originalAuthPort
  }
})

after(() => {
  if (originalRegistryFile === undefined) {
    delete process.env.LOCAL_REGISTRY_FILE
  } else {
    process.env.LOCAL_REGISTRY_FILE = originalRegistryFile
  }
})

describe('LocalRegistryService', () => {
  it('discovers configured local service instances by name', async () => {
    process.env.AUTH_SERVICE_HOST = '127.0.0.2'
    process.env.AUTH_SERVICE_PORT = '5010'

    const registry = new LocalRegistryService()
    const [instance] = await registry.discover(SERVICE_NAMES.auth)

    assert.equal(instance.name, SERVICE_NAMES.auth)
    assert.equal(instance.host, '127.0.0.2')
    assert.equal(instance.port, 5010)
    assert.equal(instance.protocol, 'tcp')
    assert.equal(instance.metadata?.source, 'local-env')
  })

  it('prefers explicitly registered instances before local env fallback', async () => {
    const registry = new LocalRegistryService()

    await registry.register({
      id: 'auth-local-test',
      name: SERVICE_NAMES.auth,
      host: '127.0.0.9',
      port: 9010,
      protocol: 'tcp',
    })

    const resolved = await registry.resolve(SERVICE_NAMES.auth)
    assert.equal(resolved.id, 'auth-local-test')
    assert.equal(resolved.host, '127.0.0.9')
    assert.equal(resolved.port, 9010)

    await registry.deregister('auth-local-test')

    const fallback = await registry.resolve(SERVICE_NAMES.auth)
    assert.notEqual(fallback.id, 'auth-local-test')
  })

  it('shares registered instances across local registry instances', async () => {
    const serviceRegistry = new LocalRegistryService()
    const gatewayRegistry = new LocalRegistryService()

    await serviceRegistry.register({
      id: 'care-cross-process-test',
      name: SERVICE_NAMES.care,
      host: '127.0.0.8',
      port: 9020,
      protocol: 'tcp',
    })

    const resolved = await gatewayRegistry.resolve(SERVICE_NAMES.care)

    assert.equal(resolved.id, 'care-cross-process-test')
    assert.equal(resolved.host, '127.0.0.8')
    assert.equal(resolved.port, 9020)
  })
})
