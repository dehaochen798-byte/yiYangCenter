import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type FieldConfig = {
  name: string
  type: 'string' | 'number' | 'boolean'
  required?: boolean
}

type ModuleConfig = {
  scope: string
  resource: string
  routePrefix: string
  requiresAuth: boolean
  fields: FieldConfig[]
}

function parseArgs(argv: string[]) {
  const args = new Map<string, string>()

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (!token.startsWith('--')) {
      continue
    }

    const key = token.slice(2)
    const value = argv[index + 1]

    if (!value || value.startsWith('--')) {
      args.set(key, 'true')
      continue
    }

    args.set(key, value)
    index += 1
  }

  return args
}

function toPascalCase(value: string) {
  return value
    .split(/[-_/\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

function toCamelCase(value: string) {
  const pascal = toPascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function parseFields(raw: string | undefined): FieldConfig[] {
  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, rawType = 'string', rawRequired = 'required'] = entry.split(':')
      const type = rawType === 'number' || rawType === 'boolean' ? rawType : 'string'

      return {
        name,
        type,
        required: rawRequired !== 'optional',
      } satisfies FieldConfig
    })
}

function renderDtoDecorators(field: FieldConfig) {
  const decorators = []

  if (!field.required) {
    decorators.push('@IsOptional()')
  }

  if (field.type === 'number') {
    decorators.push('@IsNumber()')
  } else if (field.type === 'boolean') {
    decorators.push('@IsBoolean()')
  } else {
    decorators.push('@IsString()')
  }

  return decorators.join('\n  ')
}

function renderDtoFields(fields: FieldConfig[]) {
  return fields
    .map((field) => {
      const type = field.type === 'number' ? 'number' : field.type === 'boolean' ? 'boolean' : 'string'
      const optional = field.required ? '!' : '?'
      return `  ${renderDtoDecorators(field)}\n  ${field.name}${optional}: ${type}\n`
    })
    .join('\n')
}

function renderContractFields(fields: FieldConfig[]) {
  return fields
    .map((field) => `  ${field.name}${field.required ? '' : '?'}: ${field.type === 'number' ? 'number' : field.type === 'boolean' ? 'boolean' : 'string'}`)
    .join('\n')
}

function createConfigFromArgs(args: Map<string, string>): ModuleConfig {
  const resource = args.get('name') || args.get('resource')
  const scope = args.get('scope') || 'care'

  if (!resource) {
    throw new Error('Missing required argument: --name <resource>')
  }

  return {
    scope,
    resource,
    routePrefix: args.get('route') || resource,
    requiresAuth: args.get('auth') !== 'false',
    fields: parseFields(args.get('fields')),
  }
}

async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true })
}

async function writeIfMissing(filePath: string, content: string) {
  await writeFile(filePath, content, 'utf8')
}

async function updateScopeReadme(baseDir: string, resource: string) {
  const readmePath = path.join(baseDir, 'README.md')

  let current = ''

  try {
    current = await readFile(readmePath, 'utf8')
  } catch {
    current = '# Generated Modules\n'
  }

  const marker = `- ${resource}`

  if (current.includes(marker)) {
    return
  }

  const next = `${current.trimEnd()}\n- ${resource}\n`
  await writeFile(readmePath, next, 'utf8')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const config = createConfigFromArgs(args)
  const scopePascal = toPascalCase(config.scope)
  const resourcePascal = toPascalCase(config.resource)
  const resourceCamel = toCamelCase(config.resource)
  const moduleDir = path.join(process.cwd(), 'src', 'modules', config.scope, config.resource)
  const dtoDir = path.join(moduleDir, 'dto')
  const contractsDir = path.join(process.cwd(), 'src', 'libs', 'contracts', 'generated')

  await ensureDir(dtoDir)
  await ensureDir(contractsDir)

  const dtoImports = ["import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'"]
  const createDto = `\
${dtoImports.join('\n')}

export class Create${resourcePascal}Dto {
${renderDtoFields(config.fields)}
}
`

  const updateDto = `\
${dtoImports.join('\n')}

export class Update${resourcePascal}Dto {
${renderDtoFields(
    config.fields.map((field) => ({
      ...field,
      required: false,
    }))
  )}
}
`

  const queryDto = `\
${dtoImports.join('\n')}

export class Query${resourcePascal}Dto {
  @IsOptional()
  @IsString()
  keyword?: string
}
`

  const serviceTs = `\
import { Injectable } from '@nestjs/common'
import type { Create${resourcePascal}Dto } from './dto/create-${config.resource}.dto.js'
import type { Query${resourcePascal}Dto } from './dto/query-${config.resource}.dto.js'
import type { Update${resourcePascal}Dto } from './dto/update-${config.resource}.dto.js'

@Injectable()
export class ${resourcePascal}Service {
  list(query: Query${resourcePascal}Dto) {
    return {
      code: 200,
      message: '${resourcePascal} list is ready for implementation',
      data: {
        items: [],
        query,
      },
    }
  }

  create(payload: Create${resourcePascal}Dto) {
    return {
      code: 201,
      message: '${resourcePascal} create scaffold generated',
      data: payload,
    }
  }

  update(id: number, payload: Update${resourcePascal}Dto) {
    return {
      code: 200,
      message: '${resourcePascal} update scaffold generated',
      data: {
        id,
        ...payload,
      },
    }
  }
}
`

  const controllerImports = [
    "import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'",
    config.requiresAuth ? "import { GatewayJwtGuard } from '../../../apps/gateway/security/gateway-jwt.guard.js'" : '',
    `import { ${resourcePascal}Service } from './${config.resource}.service.js'`,
    `import { Create${resourcePascal}Dto } from './dto/create-${config.resource}.dto.js'`,
    `import { Query${resourcePascal}Dto } from './dto/query-${config.resource}.dto.js'`,
    `import { Update${resourcePascal}Dto } from './dto/update-${config.resource}.dto.js'`,
  ]
    .filter(Boolean)
    .join('\n')

  const controllerTs = `\
${controllerImports}

@Controller('${config.routePrefix}')
${config.requiresAuth ? '@UseGuards(GatewayJwtGuard)' : ''}
export class ${resourcePascal}Controller {
  constructor(private readonly ${resourceCamel}Service: ${resourcePascal}Service) {}

  @Get()
  list(@Query() query: Query${resourcePascal}Dto) {
    return this.${resourceCamel}Service.list(query)
  }

  @Post()
  create(@Body() body: Create${resourcePascal}Dto) {
    return this.${resourceCamel}Service.create(body)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Update${resourcePascal}Dto) {
    return this.${resourceCamel}Service.update(Number(id), body)
  }
}
`

  const moduleTs = `\
import { Module } from '@nestjs/common'
import { ${resourcePascal}Controller } from './${config.resource}.controller.js'
import { ${resourcePascal}Service } from './${config.resource}.service.js'

@Module({
  controllers: [${resourcePascal}Controller],
  providers: [${resourcePascal}Service],
  exports: [${resourcePascal}Service],
})
export class ${resourcePascal}Module {}
`

  const contractTs = `\
export interface Create${resourcePascal}Request {
${renderContractFields(config.fields)}
}

export interface Update${resourcePascal}Request extends Partial<Create${resourcePascal}Request> {}

export interface Query${resourcePascal}Request {
  keyword?: string
}
`

  await writeIfMissing(path.join(dtoDir, `create-${config.resource}.dto.ts`), createDto)
  await writeIfMissing(path.join(dtoDir, `update-${config.resource}.dto.ts`), updateDto)
  await writeIfMissing(path.join(dtoDir, `query-${config.resource}.dto.ts`), queryDto)
  await writeIfMissing(path.join(moduleDir, `${config.resource}.service.ts`), serviceTs)
  await writeIfMissing(path.join(moduleDir, `${config.resource}.controller.ts`), controllerTs)
  await writeIfMissing(path.join(moduleDir, `${config.resource}.module.ts`), moduleTs)
  await writeIfMissing(path.join(contractsDir, `${config.scope}-${config.resource}.contract.ts`), contractTs)
  await updateScopeReadme(path.join(process.cwd(), 'src', 'modules', config.scope), config.resource)

  console.log(`Generated module scaffold: ${config.scope}/${config.resource}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
