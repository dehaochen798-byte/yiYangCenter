import 'dotenv/config'
import { hash } from 'bcryptjs'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client.js'
import {
  BedStatus,
  Gender,
  OutingStatus,
  ResidenceStatus,
  ServiceFocusStatus,
  UserStatus,
} from '../generated/prisma/enums.js'

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  const parsed = new URL(databaseUrl)
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ''))

  const adapter = new PrismaMariaDb(
    {
      host: decodeURIComponent(parsed.hostname),
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database,
      connectionLimit: 5,
      allowPublicKeyRetrieval: true,
    },
    {
      database,
    }
  )

  return new PrismaClient({ adapter })
}

async function main() {
  const prisma = createPrismaClient()

  try {
    const defaultPasswordHash = await hash('123456', 10)

    const adminUser = await prisma.user.upsert({
      where: {
        mobile: '19100001910',
      },
      update: {
        realName: 'Syah',
        nickName: 'Syah',
        age: 30,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        roleName: '系统管理员',
        departmentName: '信息部',
        passwordHash: defaultPasswordHash,
      },
      create: {
        mobile: '19100001910',
        passwordHash: defaultPasswordHash,
        realName: 'Syah',
        nickName: 'Syah',
        age: 30,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        roleName: '系统管理员',
        departmentName: '信息部',
      },
    })

    const nurseLeader = await prisma.user.upsert({
      where: {
        mobile: '19100001911',
      },
      update: {
        realName: '林晓云',
        nickName: '林晓云',
        age: 36,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '护士长',
        departmentName: '护理部',
        passwordHash: defaultPasswordHash,
      },
      create: {
        mobile: '19100001911',
        passwordHash: defaultPasswordHash,
        realName: '林晓云',
        nickName: '林晓云',
        age: 36,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '护士长',
        departmentName: '护理部',
      },
    })

    const careManager = await prisma.user.upsert({
      where: {
        mobile: '19100001912',
      },
      update: {
        realName: '陈嘉宁',
        nickName: '陈嘉宁',
        age: 33,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '健康管家',
        departmentName: '客户服务部',
        passwordHash: defaultPasswordHash,
      },
      create: {
        mobile: '19100001912',
        passwordHash: defaultPasswordHash,
        realName: '陈嘉宁',
        nickName: '陈嘉宁',
        age: 33,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '健康管家',
        departmentName: '客户服务部',
      },
    })

    const nurse = await prisma.user.upsert({
      where: {
        mobile: '19100001913',
      },
      update: {
        realName: '赵文杰',
        nickName: '赵文杰',
        age: 28,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        roleName: '护理员',
        departmentName: '护理部',
        passwordHash: defaultPasswordHash,
      },
      create: {
        mobile: '19100001913',
        passwordHash: defaultPasswordHash,
        realName: '赵文杰',
        nickName: '赵文杰',
        age: 28,
        gender: Gender.MALE,
        status: UserStatus.ACTIVE,
        roleName: '护理员',
        departmentName: '护理部',
      },
    })

    await prisma.user.upsert({
      where: {
        mobile: '19100001914',
      },
      update: {
        realName: '孙悦',
        nickName: '孙悦',
        age: 29,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '前台人员',
        departmentName: '接待部',
        passwordHash: defaultPasswordHash,
      },
      create: {
        mobile: '19100001914',
        passwordHash: defaultPasswordHash,
        realName: '孙悦',
        nickName: '孙悦',
        age: 29,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '前台人员',
        departmentName: '接待部',
      },
    })

    await prisma.user.upsert({
      where: {
        mobile: '19100001915',
      },
      update: {
        realName: '梁秋月',
        nickName: '梁秋月',
        age: 31,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '膳食管理员',
        departmentName: '膳食部',
        passwordHash: defaultPasswordHash,
      },
      create: {
        mobile: '19100001915',
        passwordHash: defaultPasswordHash,
        realName: '梁秋月',
        nickName: '梁秋月',
        age: 31,
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        roleName: '膳食管理员',
        departmentName: '膳食部',
      },
    })

    async function ensureCareLevel(input: {
      code: string
      name: string
      description: string
    }) {
      const byCode = await prisma.careLevel.findUnique({
        where: { code: input.code },
      })

      if (byCode) {
        return prisma.careLevel.update({
          where: { id: byCode.id },
          data: {
            code: input.code,
            name: input.name,
            description: input.description,
            isActive: true,
          },
        })
      }

      const byName = await prisma.careLevel.findUnique({
        where: { name: input.name },
      })

      if (byName) {
        return prisma.careLevel.update({
          where: { id: byName.id },
          data: {
            code: input.code,
            name: input.name,
            description: input.description,
            isActive: true,
          },
        })
      }

      return prisma.careLevel.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          isActive: true,
        },
      })
    }

    const [careLevelA, careLevelB, careLevelC] = await Promise.all([
      ensureCareLevel({
        code: 'CL-A',
        name: '一级护理',
        description: '适用于可自理但需日常健康关注的客户。',
      }),
      ensureCareLevel({
        code: 'CL-B',
        name: '二级护理',
        description: '适用于半失能客户，需要固定频次护理服务。',
      }),
      ensureCareLevel({
        code: 'CL-C',
        name: '三级护理',
        description: '适用于失能客户，护理频次高且需要重点看护。',
      }),
    ])

    const [room201, room202, room301] = await Promise.all([
      prisma.room.upsert({
        where: { roomNo: '201' },
        update: {
          building: 'A栋',
          floor: 2,
          roomType: '双人间',
          description: '靠近护士站，便于高频巡房。',
          isActive: true,
        },
        create: {
          building: 'A栋',
          roomNo: '201',
          floor: 2,
          roomType: '双人间',
          bedCount: 0,
          description: '靠近护士站，便于高频巡房。',
          isActive: true,
        },
      }),
      prisma.room.upsert({
        where: { roomNo: '202' },
        update: {
          building: 'A栋',
          floor: 2,
          roomType: '双人间',
          description: '采光较好，适合康复客户。',
          isActive: true,
        },
        create: {
          building: 'A栋',
          roomNo: '202',
          floor: 2,
          roomType: '双人间',
          bedCount: 0,
          description: '采光较好，适合康复客户。',
          isActive: true,
        },
      }),
      prisma.room.upsert({
        where: { roomNo: '301' },
        update: {
          building: 'B栋',
          floor: 3,
          roomType: '单人护理间',
          description: '重点护理房间。',
          isActive: true,
        },
        create: {
          building: 'B栋',
          roomNo: '301',
          floor: 3,
          roomType: '单人护理间',
          bedCount: 0,
          description: '重点护理房间。',
          isActive: true,
        },
      }),
    ])

    const [bed201A, bed201B, bed202A, bed202B, bed301A] = await Promise.all([
      prisma.bed.upsert({
        where: { roomId_bedNo_deleteVersion: { roomId: room201.id, bedNo: 'A床', deleteVersion: 0 } },
        update: {
          label: '靠窗',
          status: BedStatus.OCCUPIED,
        },
        create: {
          roomId: room201.id,
          bedNo: 'A床',
          label: '靠窗',
          status: BedStatus.OCCUPIED,
        },
      }),
      prisma.bed.upsert({
        where: { roomId_bedNo_deleteVersion: { roomId: room201.id, bedNo: 'B床', deleteVersion: 0 } },
        update: {
          label: '近门',
          status: BedStatus.VACANT,
        },
        create: {
          roomId: room201.id,
          bedNo: 'B床',
          label: '近门',
          status: BedStatus.VACANT,
        },
      }),
      prisma.bed.upsert({
        where: { roomId_bedNo_deleteVersion: { roomId: room202.id, bedNo: 'A床', deleteVersion: 0 } },
        update: {
          label: '康复位',
          status: BedStatus.OCCUPIED,
        },
        create: {
          roomId: room202.id,
          bedNo: 'A床',
          label: '康复位',
          status: BedStatus.OCCUPIED,
        },
      }),
      prisma.bed.upsert({
        where: { roomId_bedNo_deleteVersion: { roomId: room202.id, bedNo: 'B床', deleteVersion: 0 } },
        update: {
          label: '普通位',
          status: BedStatus.VACANT,
        },
        create: {
          roomId: room202.id,
          bedNo: 'B床',
          label: '普通位',
          status: BedStatus.VACANT,
        },
      }),
      prisma.bed.upsert({
        where: { roomId_bedNo_deleteVersion: { roomId: room301.id, bedNo: 'A床', deleteVersion: 0 } },
        update: {
          label: '重点护理位',
          status: BedStatus.DISABLED,
        },
        create: {
          roomId: room301.id,
          bedNo: 'A床',
          label: '重点护理位',
          status: BedStatus.DISABLED,
        },
      }),
    ])

    await Promise.all([
      prisma.room.update({
        where: { id: room201.id },
        data: { bedCount: 2 },
      }),
      prisma.room.update({
        where: { id: room202.id },
        data: { bedCount: 2 },
      }),
      prisma.room.update({
        where: { id: room301.id },
        data: { bedCount: 1 },
      }),
    ])

    const residentA = await prisma.resident.upsert({
      where: { phone: '13800001001' },
      update: {
        fullName: '王秀兰',
        age: 78,
        gender: Gender.FEMALE,
        idCard: '320101194801011234',
        emergencyContactName: '王建国',
        emergencyContactPhone: '13900001001',
        status: ResidenceStatus.ACTIVE,
        currentBedId: bed201A.id,
        careLevelId: careLevelB.id,
        note: '血压偏高，需要低盐饮食。',
      },
      create: {
        fullName: '王秀兰',
        age: 78,
        gender: Gender.FEMALE,
        phone: '13800001001',
        idCard: '320101194801011234',
        emergencyContactName: '王建国',
        emergencyContactPhone: '13900001001',
        status: ResidenceStatus.ACTIVE,
        currentBedId: bed201A.id,
        careLevelId: careLevelB.id,
        note: '血压偏高，需要低盐饮食。',
      },
    })

    const residentB = await prisma.resident.upsert({
      where: { phone: '13800001002' },
      update: {
        fullName: '李桂芳',
        age: 82,
        gender: Gender.FEMALE,
        idCard: '320101194201011235',
        emergencyContactName: '李海峰',
        emergencyContactPhone: '13900001002',
        status: ResidenceStatus.ACTIVE,
        currentBedId: bed202A.id,
        careLevelId: careLevelC.id,
        note: '行动不便，需要协助翻身和定时巡查。',
      },
      create: {
        fullName: '李桂芳',
        age: 82,
        gender: Gender.FEMALE,
        phone: '13800001002',
        idCard: '320101194201011235',
        emergencyContactName: '李海峰',
        emergencyContactPhone: '13900001002',
        status: ResidenceStatus.ACTIVE,
        currentBedId: bed202A.id,
        careLevelId: careLevelC.id,
        note: '行动不便，需要协助翻身和定时巡查。',
      },
    })

    const residentC = await prisma.resident.upsert({
      where: { phone: '13800001003' },
      update: {
        fullName: '张明德',
        age: 74,
        gender: Gender.MALE,
        idCard: '320101195001011236',
        emergencyContactName: '张丽',
        emergencyContactPhone: '13900001003',
        status: ResidenceStatus.PENDING,
        currentBedId: null,
        careLevelId: careLevelA.id,
        note: '待家属确认入住日期。',
      },
      create: {
        fullName: '张明德',
        age: 74,
        gender: Gender.MALE,
        phone: '13800001003',
        idCard: '320101195001011236',
        emergencyContactName: '张丽',
        emergencyContactPhone: '13900001003',
        status: ResidenceStatus.PENDING,
        careLevelId: careLevelA.id,
        note: '待家属确认入住日期。',
      },
    })

    const residentD = await prisma.resident.upsert({
      where: { phone: '13800001004' },
      update: {
        fullName: '周瑞华',
        age: 80,
        gender: Gender.MALE,
        idCard: '320101194601011237',
        emergencyContactName: '周婷婷',
        emergencyContactPhone: '13900001004',
        status: ResidenceStatus.CHECKED_OUT,
        currentBedId: null,
        careLevelId: careLevelA.id,
        note: '已回家休养。',
      },
      create: {
        fullName: '周瑞华',
        age: 80,
        gender: Gender.MALE,
        phone: '13800001004',
        idCard: '320101194601011237',
        emergencyContactName: '周婷婷',
        emergencyContactPhone: '13900001004',
        status: ResidenceStatus.CHECKED_OUT,
        careLevelId: careLevelA.id,
        note: '已回家休养。',
      },
    })

    await prisma.bed.update({
      where: { id: bed201A.id },
      data: {
        status: BedStatus.OCCUPIED,
      },
    })

    await prisma.bed.update({
      where: { id: bed202A.id },
      data: {
        status: BedStatus.OCCUPIED,
      },
    })

    await prisma.checkIn.upsert({
      where: { id: 1 },
      update: {
        residentId: residentA.id,
        bedId: bed201A.id,
        checkInAt: new Date('2026-05-28T09:30:00'),
        note: '已完成入住评估并签署基础协议。',
      },
      create: {
        id: 1,
        residentId: residentA.id,
        bedId: bed201A.id,
        checkInAt: new Date('2026-05-28T09:30:00'),
        note: '已完成入住评估并签署基础协议。',
      },
    })

    await prisma.checkIn.upsert({
      where: { id: 2 },
      update: {
        residentId: residentB.id,
        bedId: bed202A.id,
        checkInAt: new Date('2026-05-30T14:10:00'),
        note: '家属陪同入住，已交接常用药。',
      },
      create: {
        id: 2,
        residentId: residentB.id,
        bedId: bed202A.id,
        checkInAt: new Date('2026-05-30T14:10:00'),
        note: '家属陪同入住，已交接常用药。',
      },
    })

    await prisma.checkOut.upsert({
      where: { id: 1 },
      update: {
        residentId: residentD.id,
        bedId: null,
        checkOutAt: new Date('2026-05-20T10:20:00'),
        reason: '家属接回家中休养',
        handoverNote: '已完成药品和生活用品交接。',
      },
      create: {
        id: 1,
        residentId: residentD.id,
        checkOutAt: new Date('2026-05-20T10:20:00'),
        reason: '家属接回家中休养',
        handoverNote: '已完成药品和生活用品交接。',
      },
    })

    await prisma.outing.upsert({
      where: { id: 1 },
      update: {
        residentId: residentA.id,
        startAt: new Date('2026-06-01T08:30:00'),
        expectedReturnAt: new Date('2026-06-01T15:00:00'),
        actualReturnAt: null,
        destination: '市人民医院',
        reason: '复诊',
        status: OutingStatus.OUTING,
      },
      create: {
        id: 1,
        residentId: residentA.id,
        startAt: new Date('2026-06-01T08:30:00'),
        expectedReturnAt: new Date('2026-06-01T15:00:00'),
        destination: '市人民医院',
        reason: '复诊',
        status: OutingStatus.OUTING,
      },
    })

    await prisma.outing.upsert({
      where: { id: 2 },
      update: {
        residentId: residentB.id,
        startAt: new Date('2026-05-31T13:30:00'),
        expectedReturnAt: new Date('2026-05-31T17:30:00'),
        actualReturnAt: new Date('2026-05-31T17:10:00'),
        destination: '家属探亲',
        reason: '探亲',
        status: OutingStatus.RETURNED,
      },
      create: {
        id: 2,
        residentId: residentB.id,
        startAt: new Date('2026-05-31T13:30:00'),
        expectedReturnAt: new Date('2026-05-31T17:30:00'),
        actualReturnAt: new Date('2026-05-31T17:10:00'),
        destination: '家属探亲',
        reason: '探亲',
        status: OutingStatus.RETURNED,
      },
    })

    await prisma.mealPlan.upsert({
      where: { id: 1 },
      update: {
        residentId: residentA.id,
        title: '低盐控糖餐',
        description: '控制血压与血糖波动，减少高糖和高盐摄入。',
        dietaryRestrictions: '辛辣、生冷',
        allergens: '海鲜',
        nutritionTags: '低盐,控糖,易消化',
        startDate: new Date('2026-05-28T00:00:00'),
        endDate: new Date('2026-06-30T00:00:00'),
      },
      create: {
        id: 1,
        residentId: residentA.id,
        title: '低盐控糖餐',
        description: '控制血压与血糖波动，减少高糖和高盐摄入。',
        dietaryRestrictions: '辛辣、生冷',
        allergens: '海鲜',
        nutritionTags: '低盐,控糖,易消化',
        startDate: new Date('2026-05-28T00:00:00'),
        endDate: new Date('2026-06-30T00:00:00'),
      },
    })

    await prisma.mealPlan.upsert({
      where: { id: 2 },
      update: {
        residentId: residentB.id,
        title: '高蛋白康复餐',
        description: '增强营养摄入，辅助康复恢复。',
        dietaryRestrictions: '油炸食物',
        allergens: '无',
        nutritionTags: '高蛋白,高纤维',
        startDate: new Date('2026-05-30T00:00:00'),
        endDate: new Date('2026-06-30T00:00:00'),
      },
      create: {
        id: 2,
        residentId: residentB.id,
        title: '高蛋白康复餐',
        description: '增强营养摄入，辅助康复恢复。',
        dietaryRestrictions: '油炸食物',
        allergens: '无',
        nutritionTags: '高蛋白,高纤维',
        startDate: new Date('2026-05-30T00:00:00'),
        endDate: new Date('2026-06-30T00:00:00'),
      },
    })

    await prisma.mealCalendar.upsert({
      where: { id: 1 },
      update: {
        campus: '东区园区',
        weekLabel: '2026年第23周',
        weekStartDate: new Date('2026-06-01T00:00:00'),
        monday: '红枣燕麦粥、清蒸鲈鱼、时蔬豆腐',
        tuesday: '南瓜小米粥、番茄牛腩、清炒西兰花',
        wednesday: '山药粥、冬瓜排骨汤、香菇青菜',
        thursday: '黑米粥、虾仁蒸蛋、木耳白菜',
        friday: '玉米粥、清炖鸡块、蒜蓉菠菜',
        saturday: '百合莲子粥、红烧狮子头、时令青菜',
        sunday: '八宝粥、清蒸鳕鱼、胡萝卜炒蛋',
      },
      create: {
        id: 1,
        campus: '东区园区',
        weekLabel: '2026年第23周',
        weekStartDate: new Date('2026-06-01T00:00:00'),
        monday: '红枣燕麦粥、清蒸鲈鱼、时蔬豆腐',
        tuesday: '南瓜小米粥、番茄牛腩、清炒西兰花',
        wednesday: '山药粥、冬瓜排骨汤、香菇青菜',
        thursday: '黑米粥、虾仁蒸蛋、木耳白菜',
        friday: '玉米粥、清炖鸡块、蒜蓉菠菜',
        saturday: '百合莲子粥、红烧狮子头、时令青菜',
        sunday: '八宝粥、清蒸鳕鱼、胡萝卜炒蛋',
      },
    })

    await prisma.serviceTarget.upsert({
      where: { id: 1 },
      update: {
        residentId: residentA.id,
        managerUserId: careManager.id,
        managerName: careManager.realName,
        managerMobile: careManager.mobile,
        startDate: new Date('2026-05-28T00:00:00'),
        endDate: new Date('2026-12-31T00:00:00'),
        relationNote: '负责健康随访、家属沟通与服务协调。',
      },
      create: {
        id: 1,
        residentId: residentA.id,
        managerUserId: careManager.id,
        managerName: careManager.realName,
        managerMobile: careManager.mobile,
        startDate: new Date('2026-05-28T00:00:00'),
        endDate: new Date('2026-12-31T00:00:00'),
        relationNote: '负责健康随访、家属沟通与服务协调。',
      },
    })

    await prisma.serviceTarget.upsert({
      where: { id: 2 },
      update: {
        residentId: residentB.id,
        managerUserId: nurseLeader.id,
        managerName: nurseLeader.realName,
        managerMobile: nurseLeader.mobile,
        startDate: new Date('2026-05-30T00:00:00'),
        endDate: new Date('2026-12-31T00:00:00'),
        relationNote: '重点护理与康复跟进责任人。',
      },
      create: {
        id: 2,
        residentId: residentB.id,
        managerUserId: nurseLeader.id,
        managerName: nurseLeader.realName,
        managerMobile: nurseLeader.mobile,
        startDate: new Date('2026-05-30T00:00:00'),
        endDate: new Date('2026-12-31T00:00:00'),
        relationNote: '重点护理与康复跟进责任人。',
      },
    })

    await prisma.serviceFocus.upsert({
      where: { id: 1 },
      update: {
        residentId: residentA.id,
        serviceName: '慢病健康管理',
        detail: '每周血压血糖跟踪，月度医生回访。',
        serviceStartAt: new Date('2026-05-28T00:00:00'),
        serviceEndAt: new Date('2026-12-31T00:00:00'),
        status: ServiceFocusStatus.ACTIVE,
      },
      create: {
        id: 1,
        residentId: residentA.id,
        serviceName: '慢病健康管理',
        detail: '每周血压血糖跟踪，月度医生回访。',
        serviceStartAt: new Date('2026-05-28T00:00:00'),
        serviceEndAt: new Date('2026-12-31T00:00:00'),
        status: ServiceFocusStatus.ACTIVE,
      },
    })

    await prisma.serviceFocus.upsert({
      where: { id: 2 },
      update: {
        residentId: residentB.id,
        serviceName: '专项康复护理包',
        detail: '每日关节活动训练与饮食监督。',
        serviceStartAt: new Date('2026-05-30T00:00:00'),
        serviceEndAt: new Date('2026-08-31T00:00:00'),
        status: ServiceFocusStatus.ACTIVE,
      },
      create: {
        id: 2,
        residentId: residentB.id,
        serviceName: '专项康复护理包',
        detail: '每日关节活动训练与饮食监督。',
        serviceStartAt: new Date('2026-05-30T00:00:00'),
        serviceEndAt: new Date('2026-08-31T00:00:00'),
        status: ServiceFocusStatus.ACTIVE,
      },
    })

    const [careItem1, careItem2, careItem3, careItem4] = await Promise.all([
      prisma.careItem.upsert({
        where: { id: 1 },
        update: {
          careLevelId: careLevelA.id,
          name: '晨间血压测量',
          description: '每日晨起测量并登记血压。',
          frequency: '每日1次',
          durationMinutes: 10,
          instructions: '测量前休息 5 分钟，记录异常值。',
          isActive: true,
        },
        create: {
          id: 1,
          careLevelId: careLevelA.id,
          name: '晨间血压测量',
          description: '每日晨起测量并登记血压。',
          frequency: '每日1次',
          durationMinutes: 10,
          instructions: '测量前休息 5 分钟，记录异常值。',
          isActive: true,
        },
      }),
      prisma.careItem.upsert({
        where: { id: 2 },
        update: {
          careLevelId: careLevelB.id,
          name: '协助午间服药',
          description: '按时提醒并协助客户服药。',
          frequency: '每日1次',
          durationMinutes: 15,
          instructions: '核对药盒与服药记录，观察服药反应。',
          isActive: true,
        },
        create: {
          id: 2,
          careLevelId: careLevelB.id,
          name: '协助午间服药',
          description: '按时提醒并协助客户服药。',
          frequency: '每日1次',
          durationMinutes: 15,
          instructions: '核对药盒与服药记录，观察服药反应。',
          isActive: true,
        },
      }),
      prisma.careItem.upsert({
        where: { id: 3 },
        update: {
          careLevelId: careLevelC.id,
          name: '翻身护理',
          description: '帮助失能客户定时翻身，预防压疮。',
          frequency: '每日3次',
          durationMinutes: 20,
          instructions: '翻身时检查皮肤状态，必要时上报异常。',
          isActive: true,
        },
        create: {
          id: 3,
          careLevelId: careLevelC.id,
          name: '翻身护理',
          description: '帮助失能客户定时翻身，预防压疮。',
          frequency: '每日3次',
          durationMinutes: 20,
          instructions: '翻身时检查皮肤状态，必要时上报异常。',
          isActive: true,
        },
      }),
      prisma.careItem.upsert({
        where: { id: 4 },
        update: {
          careLevelId: careLevelC.id,
          name: '关节活动训练',
          description: '辅助康复关节活动训练。',
          frequency: '每日2次',
          durationMinutes: 25,
          instructions: '按康复计划执行，注意幅度和耐受情况。',
          isActive: true,
        },
        create: {
          id: 4,
          careLevelId: careLevelC.id,
          name: '关节活动训练',
          description: '辅助康复关节活动训练。',
          frequency: '每日2次',
          durationMinutes: 25,
          instructions: '按康复计划执行，注意幅度和耐受情况。',
          isActive: true,
        },
      }),
    ])

    await prisma.careRecord.upsert({
      where: { id: 1 },
      update: {
        residentId: residentA.id,
        careItemId: careItem1.id,
        operatorId: nurseLeader.id,
        executedAt: new Date('2026-06-01T08:10:00'),
        note: '血压 135/82，状态平稳。',
      },
      create: {
        id: 1,
        residentId: residentA.id,
        careItemId: careItem1.id,
        operatorId: nurseLeader.id,
        executedAt: new Date('2026-06-01T08:10:00'),
        note: '血压 135/82，状态平稳。',
      },
    })

    await prisma.careRecord.upsert({
      where: { id: 2 },
      update: {
        residentId: residentA.id,
        careItemId: careItem2.id,
        operatorId: nurse.id,
        executedAt: new Date('2026-06-01T12:15:00'),
        note: '按时完成服药，无不适反馈。',
      },
      create: {
        id: 2,
        residentId: residentA.id,
        careItemId: careItem2.id,
        operatorId: nurse.id,
        executedAt: new Date('2026-06-01T12:15:00'),
        note: '按时完成服药，无不适反馈。',
      },
    })

    await prisma.careRecord.upsert({
      where: { id: 3 },
      update: {
        residentId: residentB.id,
        careItemId: careItem3.id,
        operatorId: nurse.id,
        executedAt: new Date('2026-06-01T09:20:00'),
        note: '翻身完成，皮肤无明显红印。',
      },
      create: {
        id: 3,
        residentId: residentB.id,
        careItemId: careItem3.id,
        operatorId: nurse.id,
        executedAt: new Date('2026-06-01T09:20:00'),
        note: '翻身完成，皮肤无明显红印。',
      },
    })

    await prisma.careRecord.upsert({
      where: { id: 4 },
      update: {
        residentId: residentB.id,
        careItemId: careItem4.id,
        operatorId: nurseLeader.id,
        executedAt: new Date('2026-06-01T15:40:00'),
        note: '训练完成，关节活动度较昨日略有改善。',
      },
      create: {
        id: 4,
        residentId: residentB.id,
        careItemId: careItem4.id,
        operatorId: nurseLeader.id,
        executedAt: new Date('2026-06-01T15:40:00'),
        note: '训练完成，关节活动度较昨日略有改善。',
      },
    })

    console.log(
      JSON.stringify(
        {
          success: true,
          defaultLogin: {
            mobile: adminUser.mobile,
            password: '123456',
          },
          created: {
            users: 4,
            residents: 4,
            rooms: 3,
            beds: 5,
            mealPlans: 2,
            mealCalendars: 1,
            checkIns: 2,
            checkOuts: 1,
            outings: 2,
            serviceTargets: 2,
            serviceFocuses: 2,
            careLevels: 3,
            careItems: 4,
            careRecords: 4,
          },
        },
        null,
        2
      )
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
