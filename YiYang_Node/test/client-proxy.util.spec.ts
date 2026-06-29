import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HttpException, HttpStatus } from '@nestjs/common'
import { throwError } from 'rxjs'
import { sendTcpMessage } from '../src/libs/microservices/client-proxy.util.js'
import type { ClientProxy } from '@nestjs/microservices'

describe('sendTcpMessage', () => {
  it('keeps status code from direct rpc error payload', async () => {
    const error = {
      code: HttpStatus.BAD_REQUEST,
      message: '该房间已存在相同床位编号',
    }

    await expectHttpException(error, HttpStatus.BAD_REQUEST, '该房间已存在相同床位编号')
  })

  it('keeps status code from nested error payload when top-level message is a string', async () => {
    const error = {
      error: {
        code: HttpStatus.BAD_REQUEST,
        message: '该房间已存在相同床位编号',
      },
      message: '该房间已存在相同床位编号',
    }

    await expectHttpException(error, HttpStatus.BAD_REQUEST, '该房间已存在相同床位编号')
  })

  it('keeps status code from nested message payload', async () => {
    const error = {
      message: {
        code: HttpStatus.NOT_FOUND,
        message: '床位不存在',
      },
    }

    await expectHttpException(error, HttpStatus.NOT_FOUND, '床位不存在')
  })

  it('falls back to 500 for unknown rpc errors', async () => {
    await expectHttpException(new Error('socket failed'), HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  })
})

async function expectHttpException(error: unknown, status: number, message: string) {
  const client = {
    send: () => throwError(() => error),
  } as unknown as ClientProxy

  await assert.rejects(
    () => sendTcpMessage(client, { cmd: 'test' }, {}),
    (exception: unknown) => {
      assert.ok(exception instanceof HttpException)
      assert.equal(exception.getStatus(), status)
      assert.equal(exception.message, message)
      return true
    }
  )
}
