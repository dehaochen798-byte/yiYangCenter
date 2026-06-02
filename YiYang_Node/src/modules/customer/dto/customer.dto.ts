import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { GenderEnum } from '../../../common/enums/gender.enum.js'
import { ToOptionalBoolean, ToOptionalNumber, ToOptionalString } from '../../../common/dto/transformers.js'

export enum UserStatusDto {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum BedStatusDto {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  DISABLED = 'DISABLED',
}

export enum ServiceFocusStatusDto {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
}

function nowIsoString() {
  return new Date().toISOString().slice(0, 19)
}

export class SaveResidentDto {
  @IsString()
  fullName: string = ''

  @Transform(({ value }) => (value === '' || value === undefined ? 70 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(120)
  age: number = 70

  @IsEnum(GenderEnum)
  gender: GenderEnum = GenderEnum.MALE

  @IsString()
  phone: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  idCard?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  emergencyContactName?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string

  @ToOptionalNumber()
  @IsOptional()
  @IsInt()
  careLevelId?: number

  @ToOptionalString()
  @IsOptional()
  @IsString()
  note?: string
}

export class SaveUserDto {
  @IsString()
  mobile: string = ''

  @IsString()
  realName: string = ''

  @Transform(({ value }) => (value === '' || value === undefined ? 30 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(120)
  age: number = 30

  @IsEnum(GenderEnum)
  gender: GenderEnum = GenderEnum.MALE

  @ToOptionalString()
  @IsOptional()
  @IsString()
  roleName?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  departmentName?: string

  @IsEnum(UserStatusDto)
  status: UserStatusDto = UserStatusDto.ACTIVE
}

export class SaveRoomDto {
  @ToOptionalString()
  @IsOptional()
  @IsString()
  building?: string

  @IsString()
  roomNo: string = ''

  @Transform(({ value }) => (value === '' || value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(99)
  floor: number = 1

  @ToOptionalString()
  @IsOptional()
  @IsString()
  roomType?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  description?: string

  @ToOptionalBoolean()
  @IsOptional()
  @IsBoolean()
  isActive: boolean = true
}

export class SaveBedDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  roomId: number = 0

  @IsString()
  bedNo: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  label?: string

  @IsEnum(BedStatusDto)
  status: BedStatusDto = BedStatusDto.VACANT
}

export class SaveMealPlanDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @IsString()
  title: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  description?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  allergens?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  nutritionTags?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  startDate?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  endDate?: string
}

export class SaveMealCalendarDto {
  @ToOptionalString()
  @IsOptional()
  @IsString()
  campus?: string

  @IsString()
  weekLabel: string = ''

  @IsString()
  weekStartDate: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  monday?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  tuesday?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  wednesday?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  thursday?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  friday?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  saturday?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  sunday?: string
}

export class CreateCheckInDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @Transform(({ value }) => Number(value))
  @IsInt()
  bedId: number = 0

  @IsString()
  checkInAt: string = nowIsoString()

  @ToOptionalString()
  @IsOptional()
  @IsString()
  note?: string
}

export class CreateCheckOutDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @IsString()
  checkOutAt: string = nowIsoString()

  @ToOptionalString()
  @IsOptional()
  @IsString()
  reason?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  handoverNote?: string
}

export class CreateOutingDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @IsString()
  startAt: string = nowIsoString()

  @ToOptionalString()
  @IsOptional()
  @IsString()
  expectedReturnAt?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  destination?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  reason?: string
}

export class ReturnOutingDto {
  @IsString()
  actualReturnAt: string = nowIsoString()
}

export class SaveServiceTargetDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @ToOptionalNumber()
  @IsOptional()
  @IsInt()
  managerUserId?: number

  @IsString()
  managerName: string = ''

  @IsString()
  managerMobile: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  startDate?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  endDate?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  relationNote?: string
}

export class SaveServiceFocusDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @IsString()
  serviceName: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  detail?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  serviceStartAt?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  serviceEndAt?: string

  @IsEnum(ServiceFocusStatusDto)
  status: ServiceFocusStatusDto = ServiceFocusStatusDto.ACTIVE
}
