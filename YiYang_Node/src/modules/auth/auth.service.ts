import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service.js'
import { LoginDto } from './dto/login.dto.js'
import { RegisterDto } from './dto/register.dto.js'
import { resolveRoleKey } from '../../common/rbac/rbac.util.js'

const DEFAULT_INITIAL_PASSWORD = '123456'
const LEGACY_TEMP_PASSWORD_HASH = 'TEMP_PASSWORD_HASH'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: {
        mobile: dto.mobile,
      },
    })

    if (exists) {
      throw new BadRequestException('该手机号已注册')
    }

    const passwordHash = await hash(dto.password, 10)
    const realName = dto.realName.trim()

    const user = await this.prisma.user.create({
      data: {
        mobile: dto.mobile,
        passwordHash,
        realName,
        nickName: realName,
        age: dto.age,
        gender: dto.gender,
      },
      select: {
        id: true,
        mobile: true,
        realName: true,
        nickName: true,
        age: true,
        gender: true,
      },
    })

    return {
      code: 201,
      message: '注册成功',
      data: user,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        mobile: dto.mobile,
      },
    })

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误')
    }

    let matched = false

    if (user.passwordHash === LEGACY_TEMP_PASSWORD_HASH) {
      matched = dto.password === DEFAULT_INITIAL_PASSWORD

      if (matched) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            passwordHash: await hash(DEFAULT_INITIAL_PASSWORD, 10),
          },
        })
      }
    } else {
      matched = await compare(dto.password, user.passwordHash).catch(() => false)
    }

    if (!matched) {
      throw new UnauthorizedException('手机号或密码错误')
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      mobile: user.mobile,
    })

    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        profile: {
          id: user.id,
          mobile: user.mobile,
          realName: user.realName,
          nickName: user.nickName,
          age: user.age,
          gender: user.gender,
          roleName: user.roleName,
          roleKey: resolveRoleKey(user.roleName),
        },
      },
    }
  }
}
