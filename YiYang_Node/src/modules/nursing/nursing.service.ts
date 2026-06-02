import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service.js'
import type { SaveCareItemDto, SaveCareLevelDto, SaveCareRecordDto } from './dto/nursing.dto.js'

function normalizeText(value?: string | null) {
  return value?.trim() || undefined
}

@Injectable()
export class NursingService {
  constructor(private readonly prisma: PrismaService) {}

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
}
