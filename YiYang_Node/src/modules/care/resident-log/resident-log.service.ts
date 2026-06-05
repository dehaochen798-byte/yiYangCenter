import { Injectable } from '@nestjs/common'
import type { CreateResidentLogDto } from './dto/create-resident-log.dto.js'
import type { QueryResidentLogDto } from './dto/query-resident-log.dto.js'
import type { UpdateResidentLogDto } from './dto/update-resident-log.dto.js'

@Injectable()
export class ResidentLogService {
  list(query: QueryResidentLogDto) {
    return {
      code: 200,
      message: 'ResidentLog list is ready for implementation',
      data: {
        items: [],
        query,
      },
    }
  }

  create(payload: CreateResidentLogDto) {
    return {
      code: 201,
      message: 'ResidentLog create scaffold generated',
      data: payload,
    }
  }

  update(id: number, payload: UpdateResidentLogDto) {
    return {
      code: 200,
      message: 'ResidentLog update scaffold generated',
      data: {
        id,
        ...payload,
      },
    }
  }
}
