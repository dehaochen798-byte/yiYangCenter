import { Transform } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ToOptionalBoolean, ToOptionalNumber, ToOptionalString } from '../../../common/dto/transformers.js'

function nowIsoString() {
  return new Date().toISOString().slice(0, 19)
}

export class SaveCareLevelDto {
  @IsString()
  code: string = ''

  @IsString()
  name: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  description?: string

  @ToOptionalBoolean()
  @IsOptional()
  @IsBoolean()
  isActive: boolean = true
}

export class SaveCareItemDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  careLevelId: number = 0

  @IsString()
  name: string = ''

  @ToOptionalString()
  @IsOptional()
  @IsString()
  description?: string

  @ToOptionalString()
  @IsOptional()
  @IsString()
  frequency?: string

  @ToOptionalNumber()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  durationMinutes: number = 15

  @ToOptionalString()
  @IsOptional()
  @IsString()
  instructions?: string

  @ToOptionalBoolean()
  @IsOptional()
  @IsBoolean()
  isActive: boolean = true
}

export class SaveCareRecordDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  residentId: number = 0

  @Transform(({ value }) => Number(value))
  @IsInt()
  careItemId: number = 0

  @Transform(({ value }) => Number(value))
  @IsInt()
  operatorId: number = 0

  @IsString()
  executedAt: string = nowIsoString()

  @ToOptionalString()
  @IsOptional()
  @IsString()
  note?: string
}
