export const ROLE_KEYS = {
  ADMIN: 'ADMIN',
  NURSING_SUPERVISOR: 'NURSING_SUPERVISOR',
  NURSING_STAFF: 'NURSING_STAFF',
  FRONT_DESK: 'FRONT_DESK',
  MEAL_MANAGER: 'MEAL_MANAGER',
} as const

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS]

export type Actor = {
  id: number
  mobile: string
  realName: string
  nickName: string
  age: number
  gender: 'MALE' | 'FEMALE'
  status?: 'ACTIVE' | 'DISABLED'
  roleName?: string | null
  departmentName?: string | null
  roleKey: RoleKey
}

export type ActorOnlyPayload = {
  actor: Actor
}

export type ActorPayload<T> = {
  actor: Actor
  data: T
}

export type ActorUpdatePayload<T> = {
  actor: Actor
  id: number
  data: T
}

export type ActorIdPayload = {
  actor: Actor
  id: number
}
