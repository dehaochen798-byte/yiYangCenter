export const AUTH_PATTERNS = {
  register: { cmd: 'auth.register' },
  login: { cmd: 'auth.login' },
  validateToken: { cmd: 'auth.validate-token' },
} as const

export type LoginPayload = {
  mobile: string
  password: string
}

export type RegisterPayload = {
  mobile: string
  password: string
  realName: string
  age: number
  gender: 'MALE' | 'FEMALE'
}

export type AuthProfile = {
  id: number
  mobile: string
  realName: string
  nickName: string
  age: number
  gender: 'MALE' | 'FEMALE'
  status?: 'ACTIVE' | 'DISABLED'
  roleName?: string | null
  departmentName?: string | null
  roleKey?:
    | 'ADMIN'
    | 'NURSING_SUPERVISOR'
    | 'NURSING_STAFF'
    | 'FRONT_DESK'
    | 'MEAL_MANAGER'
}

export type ValidateTokenPayload = {
  authorization?: string
}

export type LoginResult = {
  token: string
  profile: AuthProfile
}
