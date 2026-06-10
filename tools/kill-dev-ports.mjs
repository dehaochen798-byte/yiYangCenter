import { backendPorts, formatPortConflicts, killListeningProcesses } from './dev-port-utils.mjs'

const released = killListeningProcesses(backendPorts)

if (!released.length) {
  process.stdout.write('[dev:kill] No backend dev ports were in use.\n')
  process.exit(0)
}

process.stdout.write('[dev:kill] Stopped listeners on backend dev ports:\n')
process.stdout.write(`${formatPortConflicts(released)}\n`)
