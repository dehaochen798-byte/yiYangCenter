import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service.js'
import type {
  GenerateCareRecordNoteDto,
  SaveCareItemDto,
  SaveCareLevelDto,
  SaveCareRecordDto,
} from './dto/nursing.dto.js'

type AiProviderConfig = {
  apiKey: string
  baseUrl: string
  model: string
  proxyUrl: string
}

type OpenAiChatClient = {
  chat: {
    completions: {
      create: (payload: {
        model: string
        temperature: number
        messages: Array<{
          role: 'system' | 'user'
          content: string
        }>
      }) => Promise<{
        choices: Array<{
          message?: {
            content?: string | null
          }
        }>
      }>
    }
  }
}

type OpenAiClientConstructor = new (options: {
  apiKey: string
  baseURL: string
  maxRetries?: number
  timeout?: number
  fetch?: typeof fetch
  fetchOptions?: {
    dispatcher?: unknown
  }
}) => OpenAiChatClient

type UndiciModule = {
  fetch: typeof fetch
  ProxyAgent: new (proxyUrl: string) => unknown
}

type CareRecordAiResident = {
  fullName: string
  status: string
  careLevel: { name: string } | null
  currentBed: {
    bedNo: string
    room: {
      building: string | null
      floor: number
      roomNo: string
    }
  } | null
}

type CareRecordAiCareItem = {
  name: string
  description: string | null
  frequency: string | null
  durationMinutes: number | null
  instructions: string | null
  careLevel: {
    name: string
  }
}

type CareRecordAiOperator = {
  id: number
  realName: string
  roleName: string | null
  departmentName: string | null
}

function normalizeText(value?: string | null) {
  return value?.trim() || undefined
}

@Injectable()
export class NursingService {
  private openai: OpenAiChatClient | null = null
  private directOpenai: OpenAiChatClient | null = null
  private aiRequestQueue: Promise<unknown> = Promise.resolve()
  private readonly aiConfig: AiProviderConfig

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService
  ) {
    this.aiConfig = configService.get<AiProviderConfig>('ai') ?? {
      apiKey: '',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
      model: 'GLM-4.7-flash',
      proxyUrl: '',
    }

  }

  getModules() {
    return {
      code: 200,
      message: '护理模块可用',
      data: ['care-level', 'care-item', 'care-record'],
    }
  }

  async listCareLevels() {
    const items = await this.prisma.careLevel.findMany({
      orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
      include: {
        _count: {
          select: {
            items: true,
            residents: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: items,
    }
  }

  async createCareLevel(payload: SaveCareLevelDto) {
    const item = await this.prisma.careLevel.create({
      data: {
        code: payload.code.trim(),
        name: payload.name.trim(),
        description: normalizeText(payload.description),
        isActive: payload.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            items: true,
            residents: true,
          },
        },
      },
    })

    return {
      code: 201,
      message: '护理级别创建成功',
      data: item,
    }
  }

  async updateCareLevel(id: number, payload: SaveCareLevelDto) {
    const item = await this.prisma.careLevel.update({
      where: { id },
      data: {
        code: payload.code.trim(),
        name: payload.name.trim(),
        description: normalizeText(payload.description),
        isActive: payload.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            items: true,
            residents: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '护理级别更新成功',
      data: item,
    }
  }

  async listCareItems() {
    const items = await this.prisma.careItem.findMany({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      include: {
        careLevel: true,
        _count: {
          select: {
            records: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: items,
    }
  }

  async createCareItem(payload: SaveCareItemDto) {
    await this.ensureCareLevelExists(payload.careLevelId)

    const item = await this.prisma.careItem.create({
      data: {
        careLevelId: payload.careLevelId,
        name: payload.name.trim(),
        description: normalizeText(payload.description),
        frequency: normalizeText(payload.frequency),
        durationMinutes: payload.durationMinutes ?? null,
        instructions: normalizeText(payload.instructions),
        isActive: payload.isActive ?? true,
      },
      include: {
        careLevel: true,
        _count: {
          select: {
            records: true,
          },
        },
      },
    })

    return {
      code: 201,
      message: '护理内容创建成功',
      data: item,
    }
  }

  async updateCareItem(id: number, payload: SaveCareItemDto) {
    await this.ensureCareLevelExists(payload.careLevelId)

    const item = await this.prisma.careItem.update({
      where: { id },
      data: {
        careLevelId: payload.careLevelId,
        name: payload.name.trim(),
        description: normalizeText(payload.description),
        frequency: normalizeText(payload.frequency),
        durationMinutes: payload.durationMinutes ?? null,
        instructions: normalizeText(payload.instructions),
        isActive: payload.isActive ?? true,
      },
      include: {
        careLevel: true,
        _count: {
          select: {
            records: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '护理内容更新成功',
      data: item,
    }
  }

  async listCareRecords() {
    const items = await this.prisma.careRecord.findMany({
      orderBy: {
        executedAt: 'desc',
      },
      include: {
        resident: true,
        careItem: {
          include: {
            careLevel: true,
          },
        },
        operator: {
          select: {
            id: true,
            realName: true,
            mobile: true,
            roleName: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: items,
    }
  }

  async createCareRecord(payload: SaveCareRecordDto) {
    await Promise.all([
      this.ensureResidentExists(payload.residentId),
      this.ensureCareItemExists(payload.careItemId),
      this.ensureUserExists(payload.operatorId),
    ])

    const item = await this.prisma.careRecord.create({
      data: {
        residentId: payload.residentId,
        careItemId: payload.careItemId,
        operatorId: payload.operatorId,
        executedAt: new Date(payload.executedAt),
        note: normalizeText(payload.note),
      },
      include: {
        resident: true,
        careItem: {
          include: {
            careLevel: true,
          },
        },
        operator: {
          select: {
            id: true,
            realName: true,
            mobile: true,
            roleName: true,
          },
        },
      },
    })

    return {
      code: 201,
      message: '护理记录创建成功',
      data: item,
    }
  }

  async updateCareRecord(id: number, payload: SaveCareRecordDto) {
    await Promise.all([
      this.ensureResidentExists(payload.residentId),
      this.ensureCareItemExists(payload.careItemId),
      this.ensureUserExists(payload.operatorId),
    ])

    const item = await this.prisma.careRecord.update({
      where: { id },
      data: {
        residentId: payload.residentId,
        careItemId: payload.careItemId,
        operatorId: payload.operatorId,
        executedAt: new Date(payload.executedAt),
        note: normalizeText(payload.note),
      },
      include: {
        resident: true,
        careItem: {
          include: {
            careLevel: true,
          },
        },
        operator: {
          select: {
            id: true,
            realName: true,
            mobile: true,
            roleName: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '护理记录更新成功',
      data: item,
    }
  }

  async deleteCareRecord(id: number) {
    const record = await this.prisma.careRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('护理记录不存在')
    }

    await this.prisma.careRecord.delete({
      where: { id },
    })

    return {
      code: 200,
      message: '护理记录删除成功',
    }
  }

  async generateCareRecordAiNote(payload: GenerateCareRecordNoteDto) {
    const openai = await this.getOpenAiClient()

    if (!openai) {
      throw new BadRequestException('未配置 AI Key，请在后端 .env 中设置 ZAI_API_KEY')
    }

    const [resident, careItem, operator] = await Promise.all([
      this.prisma.resident.findUnique({
        where: { id: payload.residentId },
        include: {
          careLevel: true,
          currentBed: {
            include: {
              room: true,
            },
          },
        },
      }),
      this.prisma.careItem.findUnique({
        where: { id: payload.careItemId },
        include: {
          careLevel: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: payload.operatorId },
        select: {
          id: true,
          realName: true,
          roleName: true,
          departmentName: true,
        },
      }),
    ])

    if (!resident) {
      throw new NotFoundException('客户不存在')
    }

    if (!careItem) {
      throw new NotFoundException('护理内容不存在')
    }

    if (!operator) {
      throw new NotFoundException('执行人不存在')
    }

    const completion = await this.enqueueAiRequest(() =>
      this.createAiCompletion(openai, payload, {
        resident,
        careItem,
        operator,
      })
    )

    const note = completion.choices[0]?.message?.content?.trim()

    if (!note) {
      throw new BadRequestException('AI 未返回护理小结，请稍后重试')
    }

    return {
      code: 200,
      message: 'AI 护理小结生成成功',
      data: {
        note,
      },
    }
  }

  private async ensureCareLevelExists(id: number) {
    const exists = await this.prisma.careLevel.findUnique({
      where: { id },
    })

    if (!exists) {
      throw new NotFoundException('护理级别不存在')
    }
  }

  private async ensureCareItemExists(id: number) {
    const exists = await this.prisma.careItem.findUnique({
      where: { id },
    })

    if (!exists) {
      throw new NotFoundException('护理内容不存在')
    }
  }

  private async ensureResidentExists(id: number) {
    const exists = await this.prisma.resident.findUnique({
      where: { id },
    })

    if (!exists) {
      throw new NotFoundException('客户不存在')
    }
  }

  private async ensureUserExists(id: number) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!exists) {
      throw new NotFoundException('执行人不存在')
    }
  }

  private buildCareRecordPrompt(
    payload: GenerateCareRecordNoteDto,
    context: {
      resident: CareRecordAiResident
      careItem: CareRecordAiCareItem
      operator: CareRecordAiOperator
    }
  ) {
    const { resident, careItem, operator } = context
    const room = resident.currentBed?.room
    const bedText =
      room && resident.currentBed
        ? `${room.building || ''}${room.floor ? `${room.floor}层` : ''}${room.roomNo}房 ${resident.currentBed.bedNo}床`
        : '未登记当前床位'

    return [
      '请基于以下信息生成一段护理执行备注。',
      '',
      `客户姓名：${resident.fullName}`,
      `客户状态：${resident.status}`,
      `护理级别：${resident.careLevel?.name || careItem.careLevel?.name || '未分级'}`,
      `当前床位：${bedText}`,
      `护理项目：${careItem.name}`,
      `项目说明：${careItem.description || '无'}`,
      `执行要求：${careItem.instructions || '无'}`,
      `频次：${careItem.frequency || '未设置'}`,
      `标准时长：${careItem.durationMinutes ?? '未设置'}分钟`,
      `执行人：${operator.realName || '未命名员工'}`,
      `执行人岗位：${operator.roleName || operator.departmentName || '未设置'}`,
      `执行时间：${payload.executedAt}`,
      `已有备注/现场输入：${payload.note || '无'}`,
      '',
      '输出要求：',
      '1. 只输出护理备注正文，不要标题、编号或解释。',
      '2. 控制在 80 到 150 个中文字符。',
      '3. 语气专业平实，适合养老院后台系统保存。',
      '4. 如果已有备注为空，按常规完成情况生成；如果已有备注包含异常，保留异常描述并给出后续观察建议。',
    ].join('\n')
  }

  private async getOpenAiClient() {
    if (!this.aiConfig.apiKey) {
      return null
    }

    if (this.openai) {
      return this.openai
    }

    this.openai = await this.createOpenAiClient(this.aiConfig.proxyUrl)

    return this.openai
  }

  private async getDirectOpenAiClient() {
    if (!this.aiConfig.apiKey) {
      return null
    }

    if (this.directOpenai) {
      return this.directOpenai
    }

    this.directOpenai = await this.createOpenAiClient('')

    return this.directOpenai
  }

  private async createOpenAiClient(proxyUrl: string) {
    try {
      const { default: OpenAIClient } = await loadOpenAiSdk()
      const proxyOptions = await createOpenAiProxyOptions(proxyUrl)

      return new OpenAIClient({
        apiKey: this.aiConfig.apiKey,
        baseURL: this.aiConfig.baseUrl,
        maxRetries: 0,
        timeout: 60000,
        ...proxyOptions,
      })
    } catch (error) {
      throw new BadRequestException(`AI SDK 加载失败：${getAiErrorMessage(error)}`)
    }
  }

  private async createAiCompletion(
    openai: OpenAiChatClient,
    payload: GenerateCareRecordNoteDto,
    context: {
      resident: CareRecordAiResident
      careItem: CareRecordAiCareItem
      operator: CareRecordAiOperator
    }
  ) {
    try {
      return await this.requestAiCompletion(openai, payload, context)
    } catch (error) {
      if (this.aiConfig.proxyUrl && isAiConnectionError(error)) {
        const directOpenai = await this.getDirectOpenAiClient()

        if (directOpenai) {
          try {
            return await this.requestAiCompletion(directOpenai, payload, context)
          } catch (directError) {
            throw new BadRequestException(
              `AI 护理小结生成失败：${getAiErrorMessage(directError)}`
            )
          }
        }
      }

      throw new BadRequestException(`AI 护理小结生成失败：${getAiErrorMessage(error)}`)
    }
  }

  private requestAiCompletion(
    openai: OpenAiChatClient,
    payload: GenerateCareRecordNoteDto,
    context: {
      resident: CareRecordAiResident
      careItem: CareRecordAiCareItem
      operator: CareRecordAiOperator
    }
  ) {
    return openai.chat.completions.create({
      model: this.aiConfig.model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            '你是养老机构护理记录助手。请生成客观、简洁、可直接保存到护理记录备注栏的中文小结，不夸大诊断，不编造未提供的生命体征或病情。',
        },
        {
          role: 'user',
          content: this.buildCareRecordPrompt(payload, context),
        },
      ],
    })
  }

  private enqueueAiRequest<T>(task: () => Promise<T>) {
    const queuedTask = this.aiRequestQueue.catch(() => undefined).then(task)
    this.aiRequestQueue = queuedTask.catch(() => undefined)

    return queuedTask
  }
}

async function loadOpenAiSdk() {
  const importer = new Function('specifier', 'return import(specifier)') as (
    specifier: string
  ) => Promise<{ default: OpenAiClientConstructor }>

  return importer('openai')
}

async function createOpenAiProxyOptions(proxyUrl: string) {
  if (!proxyUrl) {
    return {}
  }

  const importer = new Function('specifier', 'return import(specifier)') as (
    specifier: string
  ) => Promise<UndiciModule>
  const { fetch: undiciFetch, ProxyAgent } = await importer('undici')

  return {
    fetch: undiciFetch,
    fetchOptions: {
      dispatcher: new ProxyAgent(proxyUrl),
    },
  }
}

function getAiErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const status = Reflect.get(error, 'status')

    if (status === 429) {
      return 'AI 服务当前请求过多或账号限流，请稍后重试'
    }
  }

  if (error instanceof Error && error.message) {
    if (error.message === 'Request timed out.') {
      return 'AI 服务响应超时，请稍后重试或切换更快的模型'
    }

    if (error.message === 'Connection error.') {
      return '无法连接到 BigModel API，请检查本机网络、代理或防火墙是否允许访问 open.bigmodel.cn:443'
    }

    return error.message
  }

  if (error && typeof error === 'object') {
    const message = Reflect.get(error, 'message')

    if (typeof message === 'string' && message) {
      return message
    }

    const status = Reflect.get(error, 'status')
    const code = Reflect.get(error, 'code')

    if (status || code) {
      return [status ? `status=${String(status)}` : '', code ? `code=${String(code)}` : '']
        .filter(Boolean)
        .join(', ')
    }
  }

  return '未知错误'
}

function isAiConnectionError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message === 'Connection error.' || error.message === 'Request timed out.')
  )
}
