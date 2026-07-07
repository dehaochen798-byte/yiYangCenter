import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import {
  BedStatus,
  Gender,
  OutingStatus,
  ResidenceStatus,
  ServiceFocusStatus,
  UserStatus,
} from '../../../generated/prisma/enums.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import {
  createBedDeletedEvent,
  createOutingCreatedEvent,
  createOutingReturnedEvent,
  MESSAGE_BROKER,
  type DomainEvent,
  type MessageBrokerService,
} from '../../libs/message-broker/index.js'
import type { Actor } from '../../common/rbac/rbac.types.js'
import {
  assertRole,
  hasRole,
  isAdmin,
  isNursingStaff,
} from '../../common/rbac/rbac.util.js'
import { ROLE_KEYS } from '../../common/rbac/rbac.types.js'
import type {
  CreateCheckInDto,
  CreateCheckOutDto,
  CreateOutingDto,
  ReturnOutingDto,
  SaveBedDto,
  SaveMealCalendarDto,
  SaveMealPlanDto,
  SaveResidentDto,
  SaveRoomDto,
  SaveServiceFocusDto,
  SaveServiceTargetDto,
  SaveUserDto,
} from './dto/customer.dto.js'

function toDate(value?: string | null) {
  return value ? new Date(value) : null
}

function normalizeText(value?: string | null) {
  return value?.trim() || undefined
}

const DEFAULT_INITIAL_PASSWORD = '123456'
const assignedResidentReadRoles = [ROLE_KEYS.NURSING_STAFF]
const residentReadAllRoles = [
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.NURSING_SUPERVISOR,
  ROLE_KEYS.FRONT_DESK,
  ROLE_KEYS.MEAL_MANAGER,
]
const serviceTargetAdminRoles = [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR]
const roomBedRoles = [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK]
const mealRoles = [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER]

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MESSAGE_BROKER) private readonly messageBroker: MessageBrokerService
  ) {}

  getModules(actor: Actor) {
    void actor
    return {
      code: 200,
      message: '客户管理模块可用',
      data: [
        'bed',
        'meal',
        'meal-calendar',
        'check-in',
        'check-out',
        'outing',
        'service-target',
        'service-focus',
        'user',
      ],
    }
  }

  async getOverview(actor: Actor) {
    void actor
    const [residentCount, activeResidentCount, occupiedBedCount, vacantBedCount] =
      await Promise.all([
        this.prisma.resident.count(),
        this.prisma.resident.count({
          where: {
            status: ResidenceStatus.ACTIVE,
          },
        }),
        this.prisma.bed.count({
          where: {
            status: BedStatus.OCCUPIED,
            isDelete: false,
          },
        }),
        this.prisma.bed.count({
          where: {
            status: BedStatus.VACANT,
            isDelete: false,
          },
        }),
      ])

    return {
      code: 200,
      message: '查询成功',
      data: {
        residentCount,
        activeResidentCount,
        occupiedBedCount,
        vacantBedCount,
      },
    }
  }

  async listResidents(actor: Actor) {
    this.assertResidentRead(actor)
    const assignedResidentIds = isNursingStaff(actor)
      ? await this.getAssignedResidentIds(actor.id)
      : null
    const residents = await this.prisma.resident.findMany({
      where: assignedResidentIds
        ? {
            id: {
              in: assignedResidentIds,
            },
          }
        : undefined,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: {
        currentBed: {
          include: {
            room: true,
          },
        },
        careLevel: true,
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: residents,
    }
  }

  async createResident(actor: Actor, payload: SaveResidentDto) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可维护客户档案')
    await this.ensurePhoneAvailable(payload.phone)
    await this.ensureCareLevelExists(payload.careLevelId)

    const resident = await this.prisma.resident.create({
      data: {
        fullName: payload.fullName.trim(),
        age: payload.age,
        gender: payload.gender,
        phone: payload.phone.trim(),
        idCard: normalizeText(payload.idCard),
        emergencyContactName: normalizeText(payload.emergencyContactName),
        emergencyContactPhone: normalizeText(payload.emergencyContactPhone),
        careLevelId: payload.careLevelId ?? null,
        note: normalizeText(payload.note),
      },
      include: {
        currentBed: {
          include: {
            room: true,
          },
        },
        careLevel: true,
      },
    })

    return {
      code: 201,
      message: '客户档案创建成功',
      data: resident,
    }
  }

  async updateResident(actor: Actor, id: number, payload: SaveResidentDto) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可维护客户档案')
    await this.ensureResidentExists(id)
    await this.ensurePhoneAvailable(payload.phone, id)
    await this.ensureCareLevelExists(payload.careLevelId)

    const resident = await this.prisma.resident.update({
      where: { id },
      data: {
        fullName: payload.fullName.trim(),
        age: payload.age,
        gender: payload.gender,
        phone: payload.phone.trim(),
        idCard: normalizeText(payload.idCard),
        emergencyContactName: normalizeText(payload.emergencyContactName),
        emergencyContactPhone: normalizeText(payload.emergencyContactPhone),
        careLevelId: payload.careLevelId ?? null,
        note: normalizeText(payload.note),
      },
      include: {
        currentBed: {
          include: {
            room: true,
          },
        },
        careLevel: true,
      },
    })

    return {
      code: 200,
      message: '客户档案更新成功',
      data: resident,
    }
  }

  async listUsers(actor: Actor) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可查看员工账号')
    const users = await this.prisma.user.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        mobile: true,
        realName: true,
        nickName: true,
        age: true,
        gender: true,
        status: true,
        roleName: true,
        departmentName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: users,
    }
  }

  async createUser(actor: Actor, payload: SaveUserDto) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可维护员工账号')
    const exists = await this.prisma.user.findUnique({
      where: { mobile: payload.mobile.trim() },
    })

    if (exists) {
      throw new BadRequestException('手机号已存在')
    }

    const user = await this.prisma.user.create({
      data: {
        mobile: payload.mobile.trim(),
        passwordHash: await hash(DEFAULT_INITIAL_PASSWORD, 10),
        realName: payload.realName.trim(),
        nickName: payload.realName.trim(),
        age: payload.age,
        gender: payload.gender,
        status: payload.status ?? UserStatus.ACTIVE,
        roleName: normalizeText(payload.roleName),
        departmentName: normalizeText(payload.departmentName),
      },
      select: {
        id: true,
        mobile: true,
        realName: true,
        nickName: true,
        age: true,
        gender: true,
        status: true,
        roleName: true,
        departmentName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      code: 201,
      message: '用户创建成功',
      data: user,
    }
  }

  async updateUser(actor: Actor, id: number, payload: SaveUserDto) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可维护员工账号')
    const exists = await this.prisma.user.findUnique({ where: { id } })

    if (!exists) {
      throw new NotFoundException('用户不存在')
    }

    const duplicate = await this.prisma.user.findFirst({
      where: {
        mobile: payload.mobile.trim(),
        id: {
          not: id,
        },
      },
    })

    if (duplicate) {
      throw new BadRequestException('手机号已存在')
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        mobile: payload.mobile.trim(),
        realName: payload.realName.trim(),
        nickName: payload.realName.trim(),
        age: payload.age,
        gender: payload.gender,
        status: payload.status ?? UserStatus.ACTIVE,
        roleName: normalizeText(payload.roleName),
        departmentName: normalizeText(payload.departmentName),
      },
      select: {
        id: true,
        mobile: true,
        realName: true,
        nickName: true,
        age: true,
        gender: true,
        status: true,
        roleName: true,
        departmentName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      code: 200,
      message: '用户更新成功',
      data: user,
    }
  }

  async resetUserPassword(actor: Actor, id: number) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可重置员工密码')
    const exists = await this.prisma.user.findUnique({ where: { id } })

    if (!exists) {
      throw new NotFoundException('用户不存在')
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hash(DEFAULT_INITIAL_PASSWORD, 10),
      },
      select: {
        id: true,
        mobile: true,
        realName: true,
        nickName: true,
        age: true,
        gender: true,
        status: true,
        roleName: true,
        departmentName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      code: 200,
      message: `密码已重置为 ${DEFAULT_INITIAL_PASSWORD}`,
      data: user,
    }
  }

  async listRooms(actor: Actor) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可查看房间信息')
    const rooms = await this.prisma.room.findMany({
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { roomNo: 'asc' }],
      include: {
        beds: {
          orderBy: {
            bedNo: 'asc',
          },
          include: {
            currentResident: true,
          },
          where: { isDelete: false },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: rooms,
    }
  }

  async createRoom(actor: Actor, payload: SaveRoomDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可维护房间信息')
    const room = await this.prisma.room.create({
      data: {
        building: normalizeText(payload.building),
        roomNo: payload.roomNo.trim(),
        floor: payload.floor,
        roomType: normalizeText(payload.roomType),
        bedCount: 0,
        description: normalizeText(payload.description),
        isActive: payload.isActive ?? true,
      },
    })

    return {
      code: 201,
      message: '房间创建成功',
      data: room,
    }
  }

  async updateRoom(actor: Actor, id: number, payload: SaveRoomDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可维护房间信息')
    const room = await this.prisma.room.update({
      where: { id },
      data: {
        building: normalizeText(payload.building),
        roomNo: payload.roomNo.trim(),
        floor: payload.floor,
        roomType: normalizeText(payload.roomType),
        description: normalizeText(payload.description),
        isActive: payload.isActive ?? true,
      },
    })

    return {
      code: 200,
      message: '房间更新成功',
      data: room,
    }
  }

  async listBeds(actor: Actor) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可查看床位信息')
    const beds = await this.prisma.bed.findMany({
      orderBy: [{ room: { roomNo: 'asc' } }, { bedNo: 'asc' }],
      include: {
        room: true,
        currentResident: true,
      },
      where: { isDelete: false },
    })

    return {
      code: 200,
      message: '查询成功',
      data: beds,
    }
  }

  async createBed(actor: Actor, payload: SaveBedDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可维护床位信息')
    const bedNo = payload.bedNo.trim()

    if (!bedNo) {
      throw new BadRequestException('床位编号不能为空')
    }

    const room = await this.ensureRoomExists(payload.roomId)
    await this.ensureBedNoAvailable(payload.roomId, bedNo)

    const bed = await this.prisma.bed.create({
      data: {
        roomId: payload.roomId,
        bedNo,
        label: normalizeText(payload.label),
        status: payload.status ?? BedStatus.VACANT,
      },
      include: {
        room: true,
        currentResident: true,
      },
    })

    await this.refreshRoomBedCount(room.id)

    return {
      code: 201,
      message: '床位创建成功',
      data: bed,
    }
  }

  async updateBed(actor: Actor, id: number, payload: SaveBedDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可维护床位信息')
    const bedNo = payload.bedNo.trim()

    if (!bedNo) {
      throw new BadRequestException('床位编号不能为空')
    }

    const current = await this.prisma.bed.findUnique({
      where: { id },
      include: {
        currentResident: true,
      },
    })

    if (!current) {
      throw new NotFoundException('床位不存在')
    }

    await this.ensureRoomExists(payload.roomId)
    await this.ensureBedNoAvailable(payload.roomId, bedNo, id)

    if (current.currentResident && payload.status === BedStatus.VACANT) {
      throw new BadRequestException('该床位已有入住客户，不能直接改为空床')
    }

    const bed = await this.prisma.bed.update({
      where: { id },
      data: {
        roomId: payload.roomId,
        bedNo,
        label: normalizeText(payload.label),
        status: payload.status ?? current.status,
      },
      include: {
        room: true,
        currentResident: true,
      },
    })

    await Promise.all([
      this.refreshRoomBedCount(current.roomId),
      this.refreshRoomBedCount(payload.roomId),
    ])

    return {
      code: 200,
      message: '床位更新成功',
      data: bed,
    }
  }

  async deleteBed(actor: Actor, id: number) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可维护床位信息')
    const current = await this.prisma.bed.findUnique({
      where: { id },
      include: { currentResident: true },
    })

    if (!current) {
      throw new NotFoundException('床位不存在')
    }

    if (current.isDelete) {
      throw new BadRequestException('不允许重复删除，请尝试清理缓存或者联系管理员')
    }

    if (current.currentResident) {
      throw new BadRequestException('该床位已有入住客户，不能删除')
    }

    const bed = await this.prisma.bed.update({
      where: { id },
      data: {
        isDelete: true,
        deleteAt: new Date(),
        deleteVersion: id,
      },
    })

    await this.refreshRoomBedCount(current.roomId)
    await this.publishDomainEvent(
      createBedDeletedEvent({
        bedId: bed.id,
        roomId: current.roomId,
        bedNo: current.bedNo,
      })
    )

    return {
      code: 200,
      message: '床位删除成功',
    }
  }

  async listMealPlans(actor: Actor) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可查看膳食方案')
    const plans = await this.prisma.mealPlan.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        resident: {
          include: {
            currentBed: {
              include: {
                room: true,
              },
            },
          },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: plans,
    }
  }

  async createMealPlan(actor: Actor, payload: SaveMealPlanDto) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可维护膳食方案')
    await this.ensureResidentExists(payload.residentId)

    const plan = await this.prisma.mealPlan.create({
      data: {
        residentId: payload.residentId,
        title: payload.title.trim(),
        description: normalizeText(payload.description),
        dietaryRestrictions: normalizeText(payload.dietaryRestrictions),
        allergens: normalizeText(payload.allergens),
        nutritionTags: normalizeText(payload.nutritionTags),
        startDate: toDate(payload.startDate),
        endDate: toDate(payload.endDate),
      },
      include: {
        resident: true,
      },
    })

    return {
      code: 201,
      message: '膳食方案创建成功',
      data: plan,
    }
  }

  async updateMealPlan(actor: Actor, id: number, payload: SaveMealPlanDto) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可维护膳食方案')
    await this.ensureResidentExists(payload.residentId)

    const plan = await this.prisma.mealPlan.update({
      where: { id },
      data: {
        residentId: payload.residentId,
        title: payload.title.trim(),
        description: normalizeText(payload.description),
        dietaryRestrictions: normalizeText(payload.dietaryRestrictions),
        allergens: normalizeText(payload.allergens),
        nutritionTags: normalizeText(payload.nutritionTags),
        startDate: toDate(payload.startDate),
        endDate: toDate(payload.endDate),
      },
      include: {
        resident: true,
      },
    })

    return {
      code: 200,
      message: '膳食方案更新成功',
      data: plan,
    }
  }

  async deleteMealPlan(actor: Actor, id: number) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可维护膳食方案')
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id },
    })

    if (!plan) {
      throw new NotFoundException('膳食方案不存在')
    }

    await this.prisma.mealPlan.delete({
      where: { id },
    })

    return {
      code: 200,
      message: '膳食方案删除成功',
    }
  }

  async listMealCalendars(actor: Actor) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可查看膳食日历')
    const calendars = await this.prisma.mealCalendar.findMany({
      orderBy: {
        weekStartDate: 'desc',
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: calendars,
    }
  }

  async createMealCalendar(actor: Actor, payload: SaveMealCalendarDto) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可维护膳食日历')
    const calendar = await this.prisma.mealCalendar.create({
      data: {
        campus: normalizeText(payload.campus),
        weekLabel: payload.weekLabel.trim(),
        weekStartDate: new Date(payload.weekStartDate),
        monday: normalizeText(payload.monday),
        tuesday: normalizeText(payload.tuesday),
        wednesday: normalizeText(payload.wednesday),
        thursday: normalizeText(payload.thursday),
        friday: normalizeText(payload.friday),
        saturday: normalizeText(payload.saturday),
        sunday: normalizeText(payload.sunday),
      },
    })

    return {
      code: 201,
      message: '周菜单创建成功',
      data: calendar,
    }
  }

  async updateMealCalendar(actor: Actor, id: number, payload: SaveMealCalendarDto) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可维护膳食日历')
    const calendar = await this.prisma.mealCalendar.update({
      where: { id },
      data: {
        campus: normalizeText(payload.campus),
        weekLabel: payload.weekLabel.trim(),
        weekStartDate: new Date(payload.weekStartDate),
        monday: normalizeText(payload.monday),
        tuesday: normalizeText(payload.tuesday),
        wednesday: normalizeText(payload.wednesday),
        thursday: normalizeText(payload.thursday),
        friday: normalizeText(payload.friday),
        saturday: normalizeText(payload.saturday),
        sunday: normalizeText(payload.sunday),
      },
    })

    return {
      code: 200,
      message: '周菜单更新成功',
      data: calendar,
    }
  }

  async deleteMealCalendar(actor: Actor, id: number) {
    assertRole(actor, mealRoles, '仅管理员和膳食管理员可维护膳食日历')
    const calendar = await this.prisma.mealCalendar.findUnique({
      where: { id },
    })

    if (!calendar) {
      throw new NotFoundException('周菜单不存在')
    }

    await this.prisma.mealCalendar.delete({
      where: { id },
    })

    return {
      code: 200,
      message: '周菜单删除成功',
    }
  }

  async listCheckIns(actor: Actor) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可查看入住登记')
    const records = await this.prisma.checkIn.findMany({
      orderBy: {
        checkInAt: 'desc',
      },
      include: {
        resident: {
          include: {
            currentBed: {
              include: {
                room: true,
              },
            },
          },
        },
        bed: {
          include: {
            room: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: records,
    }
  }

  async createCheckIn(actor: Actor, payload: CreateCheckInDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可办理入住')
    const resident = await this.ensureResidentExists(payload.residentId)
    const bed = await this.ensureBedExists(payload.bedId)

    if (resident.currentBedId) {
      throw new BadRequestException('该客户已分配床位，请先办理退住')
    }

    if (bed.status !== BedStatus.VACANT) {
      throw new BadRequestException('当前床位不可分配')
    }

    const record = await this.prisma.$transaction(async (tx) => {
      const created = await tx.checkIn.create({
        data: {
          residentId: payload.residentId,
          bedId: payload.bedId,
          checkInAt: new Date(payload.checkInAt),
          note: normalizeText(payload.note),
        },
        include: {
          resident: true,
          bed: {
            include: {
              room: true,
            },
          },
        },
      })

      await tx.resident.update({
        where: { id: resident.id },
        data: {
          status: ResidenceStatus.ACTIVE,
          currentBedId: bed.id,
        },
      })

      await tx.bed.update({
        where: { id: bed.id },
        data: {
          status: BedStatus.OCCUPIED,
        },
      })

      return created
    })

    return {
      code: 201,
      message: '入住登记成功',
      data: record,
    }
  }

  async deleteCheckIn(actor: Actor, id: number) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可删除入住登记')
    const record = await this.prisma.checkIn.findUnique({
      where: { id },
      include: {
        resident: true,
        bed: true,
      },
    })

    if (!record) {
      throw new NotFoundException('入住记录不存在')
    }

    const latestCheckIn = await this.prisma.checkIn.findFirst({
      where: {
        residentId: record.residentId,
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    })

    if (!latestCheckIn || latestCheckIn.id !== id) {
      throw new BadRequestException('仅允许删除该客户最近一次入住登记')
    }

    if (
      record.resident.status !== ResidenceStatus.ACTIVE ||
      record.resident.currentBedId !== record.bedId
    ) {
      throw new BadRequestException('该入住记录已影响后续流程，请先处理对应退住登记')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.checkIn.delete({
        where: { id },
      })

      await tx.resident.update({
        where: { id: record.residentId },
        data: {
          status: ResidenceStatus.PENDING,
          currentBedId: null,
        },
      })

      await tx.bed.update({
        where: { id: record.bedId },
        data: {
          status: BedStatus.VACANT,
        },
      })
    })

    return {
      code: 200,
      message: '入住登记删除成功',
    }
  }

  async listCheckOuts(actor: Actor) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可查看退住登记')
    const records = await this.prisma.checkOut.findMany({
      orderBy: {
        checkOutAt: 'desc',
      },
      include: {
        resident: true,
        bed: {
          include: {
            room: true,
          },
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: records,
    }
  }

  async createCheckOut(actor: Actor, payload: CreateCheckOutDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可办理退住')
    const resident = await this.ensureResidentExists(payload.residentId)

    if (!resident.currentBedId) {
      throw new BadRequestException('该客户当前未入住，无需退住')
    }

    const record = await this.prisma.$transaction(async (tx) => {
      const created = await tx.checkOut.create({
        data: {
          residentId: resident.id,
          bedId: resident.currentBedId,
          checkOutAt: new Date(payload.checkOutAt),
          reason: normalizeText(payload.reason),
          handoverNote: normalizeText(payload.handoverNote),
        },
        include: {
          resident: true,
          bed: {
            include: {
              room: true,
            },
          },
        },
      })

      await tx.resident.update({
        where: { id: resident.id },
        data: {
          status: ResidenceStatus.CHECKED_OUT,
          currentBedId: null,
        },
      })

      await tx.bed.update({
        where: { id: resident.currentBedId! },
        data: {
          status: BedStatus.VACANT,
        },
      })

      return created
    })

    return {
      code: 201,
      message: '退住登记成功',
      data: record,
    }
  }

  async deleteCheckOut(actor: Actor, id: number) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可删除退住登记')
    const record = await this.prisma.checkOut.findUnique({
      where: { id },
      include: {
        resident: true,
        bed: {
          include: {
            currentResident: true,
          },
        },
      },
    })

    if (!record) {
      throw new NotFoundException('退住记录不存在')
    }

    if (!record.bedId || !record.bed) {
      throw new BadRequestException('该退住记录缺少原床位信息，无法删除')
    }

    const bedId = record.bedId
    const latestCheckOut = await this.prisma.checkOut.findFirst({
      where: {
        residentId: record.residentId,
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    })

    if (!latestCheckOut || latestCheckOut.id !== id) {
      throw new BadRequestException('仅允许删除该客户最近一次退住登记')
    }

    if (
      record.resident.status !== ResidenceStatus.CHECKED_OUT ||
      record.resident.currentBedId !== null
    ) {
      throw new BadRequestException('该退住记录已影响后续流程，无法直接删除')
    }

    if (record.bed.isDelete) {
      throw new BadRequestException('原床位已删除，无法恢复该退住登记')
    }

    if (record.bed.currentResident || record.bed.status !== BedStatus.VACANT) {
      throw new BadRequestException('原床位当前不可恢复，请先处理床位占用状态')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.checkOut.delete({
        where: { id },
      })

      await tx.resident.update({
        where: { id: record.residentId },
        data: {
          status: ResidenceStatus.ACTIVE,
          currentBedId: bedId,
        },
      })

      await tx.bed.update({
        where: { id: bedId },
        data: {
          status: BedStatus.OCCUPIED,
        },
      })
    })

    return {
      code: 200,
      message: '退住登记删除成功',
    }
  }

  async listOutings(actor: Actor) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可查看外出登记')
    const outings = await this.prisma.outing.findMany({
      orderBy: {
        startAt: 'desc',
      },
      include: {
        resident: true,
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: outings,
    }
  }

  async createOuting(actor: Actor, payload: CreateOutingDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可办理外出登记')
    const resident = await this.ensureResidentExists(payload.residentId)

    if (resident.status !== ResidenceStatus.ACTIVE) {
      throw new BadRequestException('只有在住客户才可办理外出')
    }

    const exists = await this.prisma.outing.findFirst({
      where: {
        residentId: payload.residentId,
        status: {
          in: [OutingStatus.PENDING, OutingStatus.OUTING],
        },
      },
    })

    if (exists) {
      throw new BadRequestException('该客户已有未归院的外出记录')
    }

    const outing = await this.prisma.outing.create({
      data: {
        residentId: payload.residentId,
        startAt: new Date(payload.startAt),
        expectedReturnAt: toDate(payload.expectedReturnAt),
        destination: normalizeText(payload.destination),
        reason: normalizeText(payload.reason),
        status: OutingStatus.OUTING,
      },
      include: {
        resident: true,
      },
    })
    await this.publishDomainEvent(
      createOutingCreatedEvent({
        outingId: outing.id,
        residentId: outing.residentId,
        residentName: outing.resident.fullName,
        destination: outing.destination,
        startAt: outing.startAt,
        expectedReturnAt: outing.expectedReturnAt,
      })
    )

    return {
      code: 201,
      message: '外出登记成功',
      data: outing,
    }
  }

  async returnOuting(actor: Actor, id: number, payload: ReturnOutingDto) {
    assertRole(actor, roomBedRoles, '仅管理员和前台人员可办理归院登记')
    const outing = await this.prisma.outing.findUnique({
      where: { id },
    })

    if (!outing) {
      throw new NotFoundException('外出记录不存在')
    }

    const updated = await this.prisma.outing.update({
      where: { id },
      data: {
        actualReturnAt: new Date(payload.actualReturnAt),
        status: OutingStatus.RETURNED,
      },
      include: {
        resident: true,
      },
    })
    await this.publishDomainEvent(
      createOutingReturnedEvent({
        outingId: updated.id,
        residentId: updated.residentId,
        residentName: updated.resident.fullName,
        actualReturnAt: updated.actualReturnAt ?? new Date(payload.actualReturnAt),
      })
    )

    return {
      code: 200,
      message: '归院登记成功',
      data: updated,
    }
  }

  async listServiceTargets(actor: Actor) {
    assertRole(actor, serviceTargetAdminRoles, '仅管理员和护理主管可查看服务对象关系')
    const items = await this.prisma.serviceTarget.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        resident: true,
        managerUser: {
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

  async createServiceTarget(actor: Actor, payload: SaveServiceTargetDto) {
    assertRole(actor, serviceTargetAdminRoles, '仅管理员和护理主管可维护服务对象关系')
    await this.ensureResidentExists(payload.residentId)
    await this.ensureManagerExists(payload.managerUserId)

    const item = await this.prisma.serviceTarget.create({
      data: {
        residentId: payload.residentId,
        managerUserId: payload.managerUserId ?? null,
        managerName: payload.managerName.trim(),
        managerMobile: payload.managerMobile.trim(),
        startDate: toDate(payload.startDate),
        endDate: toDate(payload.endDate),
        relationNote: normalizeText(payload.relationNote),
      },
      include: {
        resident: true,
        managerUser: {
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
      message: '服务对象关系创建成功',
      data: item,
    }
  }

  async updateServiceTarget(actor: Actor, id: number, payload: SaveServiceTargetDto) {
    assertRole(actor, serviceTargetAdminRoles, '仅管理员和护理主管可维护服务对象关系')
    await this.ensureResidentExists(payload.residentId)
    await this.ensureManagerExists(payload.managerUserId)

    const item = await this.prisma.serviceTarget.update({
      where: { id },
      data: {
        residentId: payload.residentId,
        managerUserId: payload.managerUserId ?? null,
        managerName: payload.managerName.trim(),
        managerMobile: payload.managerMobile.trim(),
        startDate: toDate(payload.startDate),
        endDate: toDate(payload.endDate),
        relationNote: normalizeText(payload.relationNote),
      },
      include: {
        resident: true,
        managerUser: {
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
      message: '服务对象关系更新成功',
      data: item,
    }
  }

  async listServiceFocuses(actor: Actor) {
    if (!hasRole(actor, [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_STAFF])) {
      throw new ForbiddenException('仅管理员和护理人员可查看服务关注信息')
    }

    const assignedResidentIds = isNursingStaff(actor)
      ? await this.getAssignedResidentIds(actor.id)
      : null
    const items = await this.prisma.serviceFocus.findMany({
      where: assignedResidentIds
        ? {
            residentId: {
              in: assignedResidentIds,
            },
          }
        : undefined,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        resident: true,
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: items,
    }
  }

  async createServiceFocus(actor: Actor, payload: SaveServiceFocusDto) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可维护服务关注信息')
    await this.ensureResidentExists(payload.residentId)

    const item = await this.prisma.serviceFocus.create({
      data: {
        residentId: payload.residentId,
        serviceName: payload.serviceName.trim(),
        detail: normalizeText(payload.detail),
        serviceStartAt: toDate(payload.serviceStartAt),
        serviceEndAt: toDate(payload.serviceEndAt),
        status: payload.status ?? ServiceFocusStatus.ACTIVE,
      },
      include: {
        resident: true,
      },
    })

    return {
      code: 201,
      message: '服务关注创建成功',
      data: item,
    }
  }

  async updateServiceFocus(actor: Actor, id: number, payload: SaveServiceFocusDto) {
    assertRole(actor, [ROLE_KEYS.ADMIN], '仅管理员可维护服务关注信息')
    await this.ensureResidentExists(payload.residentId)

    const item = await this.prisma.serviceFocus.update({
      where: { id },
      data: {
        residentId: payload.residentId,
        serviceName: payload.serviceName.trim(),
        detail: normalizeText(payload.detail),
        serviceStartAt: toDate(payload.serviceStartAt),
        serviceEndAt: toDate(payload.serviceEndAt),
        status: payload.status ?? ServiceFocusStatus.ACTIVE,
      },
      include: {
        resident: true,
      },
    })

    return {
      code: 200,
      message: '服务关注更新成功',
      data: item,
    }
  }

  private async ensurePhoneAvailable(phone: string, residentId?: number) {
    const exists = await this.prisma.resident.findFirst({
      where: {
        phone: phone.trim(),
        ...(residentId
          ? {
              id: {
                not: residentId,
              },
            }
          : {}),
      },
    })

    if (exists) {
      throw new BadRequestException('客户手机号已存在')
    }
  }

  private async ensureResidentExists(id: number) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },
    })

    if (!resident) {
      throw new NotFoundException('客户不存在')
    }

    return resident
  }

  private async ensureCareLevelExists(id?: number | null) {
    if (!id) {
      return
    }

    const exists = await this.prisma.careLevel.findUnique({
      where: { id },
    })

    if (!exists) {
      throw new NotFoundException('护理级别不存在')
    }
  }

  private async ensureRoomExists(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      throw new NotFoundException('房间不存在')
    }

    return room
  }

  private async ensureBedExists(id: number) {
    const bed = await this.prisma.bed.findUnique({
      where: { id },
    })

    if (!bed || bed?.isDelete) {
      throw new NotFoundException('床位不存在')
    }

    return bed
  }

  private async ensureBedNoAvailable(
    roomId: number,
    bedNo: string,
    currentBedId?: number
  ) {
    const existing = await this.prisma.bed.findFirst({
      where: {
        roomId,
        bedNo,
        isDelete: false,
      },
      select: {
        id: true,
      },
    })

    if (existing && existing.id !== currentBedId) {
      throw new BadRequestException('该房间已存在相同床位编号')
    }
  }

  private async ensureManagerExists(id?: number | null) {
    if (!id) {
      return
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('健康管家不存在')
    }
  }

  private assertResidentRead(actor: Actor) {
    if (
      !hasRole(actor, [...residentReadAllRoles, ...assignedResidentReadRoles])
    ) {
      throw new ForbiddenException('无权查看客户档案')
    }
  }

  private async getAssignedResidentIds(userId: number) {
    const today = new Date()
    const relations = await this.prisma.serviceTarget.findMany({
      where: {
        managerUserId: userId,
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: today } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        ],
      },
      select: {
        residentId: true,
      },
    })

    return relations.map((item) => item.residentId)
  }

  private async refreshRoomBedCount(roomId: number) {
    const count = await this.prisma.bed.count({
      where: {
        roomId,
        isDelete: false,
      },
    })

    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        bedCount: count,
      },
    })
  }

  private async publishDomainEvent(event: DomainEvent) {
    try {
      await this.messageBroker.publish(event)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[message-broker] failed to publish ${event.eventType}: ${message}`)
    }
  }
}
