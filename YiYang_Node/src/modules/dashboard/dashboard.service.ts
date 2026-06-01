import { Injectable } from '@nestjs/common'
import { BedStatus, OutingStatus, ResidenceStatus, ServiceFocusStatus } from '../../../generated/prisma/enums.js'
import { PrismaService } from '../../prisma/prisma.service.js'

function startOfToday() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const today = startOfToday()

    const [
      residentCount,
      activeResidentCount,
      pendingResidentCount,
      checkedOutResidentCount,
      availableBeds,
      occupiedBeds,
      disabledBeds,
      careRecordsToday,
      activeOutings,
      activeServices,
      latestCheckIns,
      latestOutings,
      latestCareRecords,
      careLevelStats,
      roomStats,
    ] = await Promise.all([
      this.prisma.resident.count(),
      this.prisma.resident.count({
        where: {
          status: ResidenceStatus.ACTIVE,
        },
      }),
      this.prisma.resident.count({
        where: {
          status: ResidenceStatus.PENDING,
        },
      }),
      this.prisma.resident.count({
        where: {
          status: ResidenceStatus.CHECKED_OUT,
        },
      }),
      this.prisma.bed.count({
        where: {
          status: BedStatus.VACANT,
        },
      }),
      this.prisma.bed.count({
        where: {
          status: BedStatus.OCCUPIED,
        },
      }),
      this.prisma.bed.count({
        where: {
          status: BedStatus.DISABLED,
        },
      }),
      this.prisma.careRecord.count({
        where: {
          executedAt: {
            gte: today,
          },
        },
      }),
      this.prisma.outing.count({
        where: {
          status: OutingStatus.OUTING,
        },
      }),
      this.prisma.serviceFocus.count({
        where: {
          status: ServiceFocusStatus.ACTIVE,
        },
      }),
      this.prisma.checkIn.findMany({
        take: 5,
        orderBy: {
          checkInAt: 'desc',
        },
        include: {
          resident: true,
          bed: {
            include: {
              room: true,
            },
          },
        },
      }),
      this.prisma.outing.findMany({
        take: 5,
        orderBy: {
          startAt: 'desc',
        },
        include: {
          resident: true,
        },
      }),
      this.prisma.careRecord.findMany({
        take: 5,
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
              roleName: true,
            },
          },
        },
      }),
      this.prisma.careLevel.findMany({
        orderBy: {
          code: 'asc',
        },
        include: {
          _count: {
            select: {
              residents: true,
              items: true,
            },
          },
        },
      }),
      this.prisma.room.findMany({
        orderBy: [{ building: 'asc' }, { floor: 'asc' }, { roomNo: 'asc' }],
        include: {
          beds: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
    ])

    return {
      code: 200,
      message: '获取工作台统计成功',
      data: {
        summary: {
          residentCount,
          activeResidentCount,
          pendingResidentCount,
          checkedOutResidentCount,
          availableBeds,
          occupiedBeds,
          disabledBeds,
          careRecordsToday,
          activeOutings,
          activeServices,
        },
        latestCheckIns,
        latestOutings,
        latestCareRecords,
        careLevelStats,
        roomStats: roomStats.map((item) => ({
          id: item.id,
          building: item.building,
          roomNo: item.roomNo,
          floor: item.floor,
          roomType: item.roomType,
          bedCount: item.bedCount,
          occupiedCount: item.beds.filter((bed) => bed.status === BedStatus.OCCUPIED).length,
          vacantCount: item.beds.filter((bed) => bed.status === BedStatus.VACANT).length,
          disabledCount: item.beds.filter((bed) => bed.status === BedStatus.DISABLED).length,
        })),
      },
    }
  }
}
