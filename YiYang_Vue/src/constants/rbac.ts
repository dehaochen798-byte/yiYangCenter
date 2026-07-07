export const ROLE_KEYS = {
  ADMIN: 'ADMIN',
  NURSING_SUPERVISOR: 'NURSING_SUPERVISOR',
  NURSING_STAFF: 'NURSING_STAFF',
  FRONT_DESK: 'FRONT_DESK',
  MEAL_MANAGER: 'MEAL_MANAGER',
} as const

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS]

export const roleLabelMap: Record<RoleKey, string> = {
  ADMIN: '管理员',
  NURSING_SUPERVISOR: '护理主管',
  NURSING_STAFF: '护理人员',
  FRONT_DESK: '前台人员',
  MEAL_MANAGER: '膳食管理员',
}

export function hasRole(roleKey: RoleKey | undefined, roles: RoleKey[]) {
  return Boolean(roleKey && roles.includes(roleKey))
}
