import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class QueryResidentLogDto {
  @IsOptional()
  @IsString()
  keyword?: string
}
