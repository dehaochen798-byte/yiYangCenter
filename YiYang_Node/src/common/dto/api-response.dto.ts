export class ApiResponseDto<T = unknown> {
  code!: number
  message!: string
  data?: T
}
