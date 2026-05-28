import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'
import { GenderEnum } from '../../../common/enums/gender.enum.js'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  mobile!: string

  @IsString()
  @IsNotEmpty()
  password!: string

  @IsString()
  @IsNotEmpty()
  nickName!: string

  @IsInt()
  @Min(1)
  @Max(120)
  age!: number

  @IsEnum(GenderEnum)
  gender!: GenderEnum
}
