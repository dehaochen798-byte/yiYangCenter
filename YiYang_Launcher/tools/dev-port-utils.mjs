import { execFileSync } from 'node:child_process'

export const backendPorts = [3000, 4010, 4020]

function parseWindowsNetstat(output, targetPorts) {
  const ports = new Set(targetPorts)
  const records = new Map()

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line.startsWith('TCP')) {
      continue
    }

    const parts = line.split(/\s+/)

    if (parts.length < 5 || parts[3] !== 'LISTENING') {
      continue
    }

    const localAddress = parts[1]
    const pid = Number(parts[4])
    const match = localAddress.match(/:(\d+)$/)

    if (!match) {
      continue
    }

    const port = Number(match[1])

    if (!ports.has(port) || !Number.isInteger(pid) || pid <= 0) {
      continue
    }

    records.set(`${port}:${pid}`, { port, pid })
  }

  return [...records.values()].sort((left, right) => left.port - right.port)
}

function parseUnixLsof(output, targetPorts) {
  const ports = new Set(targetPorts)
  const records = new Map()

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) {
      continue
    }

    const [pidValue, portValue] = line.split(':')
    const pid = Number(pidValue)
    const port = Number(portValue)

    if (!ports.has(port) || !Number.isInteger(pid) || pid <= 0) {
      continue
    }

    records.set(`${port}:${pid}`, { port, pid })
  }

  return [...records.values()].sort((left, right) => left.port - right.port)
}

export function findListeningProcesses(targetPorts = backendPorts) {
  try {
    if (process.platform === 'win32') {
      const output = execFileSync('netstat', ['-ano'], { encoding: 'utf8' })
      return parseWindowsNetstat(output, targetPorts)
    }

    const output = execFileSync('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN', '-F', 'pn'], {
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .reduce((lines, line) => {
        if (line.startsWith('p')) {
          lines.push(line.slice(1))
          return lines
        }

        if (line.startsWith('n')) {
          const currentPid = lines.pop()
          if (currentPid) {
            lines.push(`${currentPid}:${line.slice(1).match(/:(\d+)$/)?.[1] ?? ''}`)
          }
        }

        return lines
      }, [])
      .join('\n')

    return parseUnixLsof(output, targetPorts)
  } catch {
    return []
  }
}

export function formatPortConflicts(records) {
  return records.map((record) => `- port ${record.port} is already in use by PID ${record.pid}`).join('\n')
}

export function killListeningProcesses(targetPorts = backendPorts) {
  const records = findListeningProcesses(targetPorts)
  const pids = [...new Set(records.map((record) => record.pid))]

  for (const pid of pids) {
    if (process.platform === 'win32') {
      try {
        execFileSync('taskkill', ['/PID', String(pid), '/F'], { stdio: 'ignore' })
      } catch {
        // The listener can disappear between netstat and taskkill during watch restarts.
      }
      continue
    }

    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // The process may already have exited.
    }
  }

  return records
}
