import { Injectable } from '@nestjs/common'
import type { OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined')
    }

    const parsedUrl = new URL(databaseUrl)
    const adapter = new PrismaMariaDb({
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 3306),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, ''),
      connectTimeout: 5_000,
      acquireTimeout: 10_000,
      idleTimeout: 300,
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }
}
