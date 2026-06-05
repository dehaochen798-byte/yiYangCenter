export interface ApiSuccessResponse<T = unknown> {
  code: number
  message: string
  data?: T
}
