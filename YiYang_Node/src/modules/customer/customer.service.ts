import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { BedStatus, Gender, OutingStatus, ResidenceStatus, ServiceFocusStatus, UserStatus } from '../../../generated/prisma/enums.js'
import { PrismaService } from '../../prisma/prisma.service.js'

type IdPayload = {
  id: number
}

type ResidentPayload = {
  fullName: string
  age: number
  gender: Gender
  phone: string
  idCard?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  careLevelId?: number | null
  note?: string
}

type UserPayload = {
  mobile: string
  realName: string
  age: number
  gender: Gender
  roleName?: string
  departmentName?: string
  status?: UserStatus
}

type RoomPayload = {
  building?: string
  roomNo: string
  floor: number
  roomType?: string
  description?: string
  isActive?: boolean
}

type BedPayload = {
  roomId: number
  bedNo: string
  label?: string
  status?: BedStatus
}

type MealPlanPayload = {
  residentId: number
  title: string
  description?: string
  dietaryRestrictions?: string
  allergens?: string
  nutritionTags?: string
  startDate?: string
  endDate?: string
}

type MealCalendarPayload = {
  campus?: string
  weekLabel: string
  weekStartDate: string
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

type CheckInPayload = {
  residentId: number
  bedId: number
  checkInAt: string
  note?: string
}

type CheckOutPayload = {
  residentId: number
  checkOutAt: string
  reason?: string
  handoverNote?: string
}

type OutingPayload = {
  residentId: number
  startAt: string
  expectedReturnAt?: string
  destination?: string
  reason?: string
}

type ReturnOutingPayload = {
  actualReturnAt: string
}

type ServiceTargetPayload = {
  residentId: number
  managerUserId?: number | null
  managerName: string
  managerMobile: string
  startDate?: string
  endDate?: string
  relationNote?: string
}

type ServiceFocusPayload = {
  residentId: number
  serviceName: string
  detail?: string
  serviceStartAt?: string
  serviceEndAt?: string
  status?: ServiceFocusStatus
}

function toDate(value?: string | null) {
  return value ? new Date(value) : null
}

function normalizeText(value?: string | null) {
  return value?.trim() || undefined
}

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  getModules() {
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

  async getOverview() {
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
          },
        }),
        this.prisma.bed.count({
          where: {
            status: BedStatus.VACANT,
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

  async listResidents() {
    const residents = await this.prisma.resident.findMany({
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

  async createResident(payload: ResidentPayload) {
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

  async updateResident(id: number, payload: ResidentPayload) {
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

  async listUsers() {
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

  async createUser(payload: UserPayload) {
    const exists = await this.prisma.user.findUnique({
      where: { mobile: payload.mobile.trim() },
    })

    if (exists) {
      throw new BadRequestException('手机号已存在')
    }

    const user = await this.prisma.user.create({
      data: {
        mobile: payload.mobile.trim(),
        passwordHash: await hash('123456', 10),
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

  async updateUser(id: number, payload: UserPayload) {
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

  async listRooms() {
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
        },
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: rooms,
    }
  }

  async createRoom(payload: RoomPayload) {
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

  async updateRoom(id: number, payload: RoomPayload) {
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

  async listBeds() {
    const beds = await this.prisma.bed.findMany({
      orderBy: [{ room: { roomNo: 'asc' } }, { bedNo: 'asc' }],
      include: {
        room: true,
        currentResident: true,
      },
    })

    return {
      code: 200,
      message: '查询成功',
      data: beds,
    }
  }

  async createBed(payload: BedPayload) {
    const room = await this.ensureRoomExists(payload.roomId)

    const bed = await this.prisma.bed.create({
      data: {
        roomId: payload.roomId,
        bedNo: payload.bedNo.trim(),
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

  async updateBed(id: number, payload: BedPayload) {
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

    if (current.currentResident && payload.status === BedStatus.VACANT) {
      throw new BadRequestException('该床位已有入住客户，不能直接改为空床')
    }

    const bed = await this.prisma.bed.update({
      where: { id },
      data: {
        roomId: payload.roomId,
        bedNo: payload.bedNo.trim(),
        label: normalizeText(payload.label),
        status: payload.status ?? current.status,
      },
      include: {
        room: true,
        currentResident: true,
      },
    })

    await Promise.all([this.refreshRoomBedCount(current.roomId), this.refreshRoomBedCount(payload.roomId)])

    return {
      code: 200,
      message: '床位更新成功',
      data: bed,
    }
  }

  async listMealPlans() {
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

  async createMealPlan(payload: MealPlanPayload) {
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

  async updateMealPlan(id: number, payload: MealPlanPayload) {
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

  async listMealCalendars() {
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

  async createMealCalendar(payload: MealCalendarPayload) {
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

  async updateMealCalendar(id: number, payload: MealCalendarPayload) {
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

  async listCheckIns() {
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

  async createCheckIn(payload: CheckInPayload) {
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

  async listCheckOuts() {
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

  async createCheckOut(payload: CheckOutPayload) {
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

  async listOutings() {
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

  async createOuting(payload: OutingPayload) {
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

    return {
      code: 201,
      message: '外出登记成功',
      data: outing,
    }
  }

  async returnOuting(id: number, payload: ReturnOutingPayload) {
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

    return {
      code: 200,
      message: '归院登记成功',
      data: updated,
    }
  }

  async listServiceTargets() {
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

  async createServiceTarget(payload: ServiceTargetPayload) {
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

  async updateServiceTarget(id: number, payload: ServiceTargetPayload) {
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

  async listServiceFocuses() {
    const items = await this.prisma.serviceFocus.findMany({
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

  async createServiceFocus(payload: ServiceFocusPayload) {
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

  async updateServiceFocus(id: number, payload: ServiceFocusPayload) {
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

    if (!bed) {
      throw new NotFoundException('床位不存在')
    }

    return bed
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

  private async refreshRoomBedCount(roomId: number) {
    const count = await this.prisma.bed.count({
      where: {
        roomId,
      },
    })

    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        bedCount: count,
      },
    })
  }
}
