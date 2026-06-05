import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateResidentLogDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsNumber()
  age?: number

  @IsOptional()
  @IsBoolean()
  enabled?: boolean

}
