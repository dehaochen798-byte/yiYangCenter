import { spawn } from 'node:child_process'

const workspace = 'YiYang_Node'
const services = [
  {
    name: 'gateway',
    script: 'start:gateway:dev',
    color: '\x1b[36m',
  },
  {
    name: 'service-auth',
    script: 'start:service-auth:dev',
    color: '\x1b[33m',
  },
  {
    name: 'service-care',
    script: 'start:service-care:dev',
    color: '\x1b[35m',
  },
]

const resetColor = '\x1b[0m'
const children = new Set()

function prefixOutput(serviceName, color, stream) {
  let buffer = ''

  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line) {
        continue
      }

      process.stdout.write(`${color}[${serviceName}]${resetColor} ${line}\n`)
    }
  })

  stream.on('end', () => {
    if (buffer) {
      process.stdout.write(`${color}[${serviceName}]${resetColor} ${buffer}\n`)
    }
  })
}

function spawnService(service) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', `npm run ${service.script} -w ${workspace}`]
      : ['run', service.script, '-w', workspace]

  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  })

  children.add(child)
  prefixOutput(service.name, service.color, child.stdout)
  prefixOutput(service.name, service.color, child.stderr)

  child.on('exit', (code, signal) => {
    children.delete(child)

    if (signal) {
      process.stdout.write(`${service.color}[${service.name}]${resetColor} exited with signal ${signal}\n`)
      return
    }

    process.stdout.write(`${service.color}[${service.name}]${resetColor} exited with code ${code ?? 0}\n`)

    if (code && code !== 0) {
      shutdown(code)
    }
  })
}

let shuttingDown = false

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children) {
    child.kill('SIGINT')
  }

  setTimeout(() => {
    for (const child of children) {
      child.kill('SIGTERM')
    }

    process.exit(exitCode)
  }, 200)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

for (const service of services) {
  spawnService(service)
}
