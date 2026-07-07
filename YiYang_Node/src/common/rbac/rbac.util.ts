import { ForbiddenException } from '@nestjs/common'
import { ROLE_KEYS, type Actor, type RoleKey } from './rbac.types.js'

const legacyRoleMap: Record<string, RoleKey> = {
  管理员: ROLE_KEYS.ADMIN,
  系统管理员: ROLE_KEYS.ADMIN,
  护理主管: ROLE_KEYS.NURSING_SUPERVISOR,
  护士长: ROLE_KEYS.NURSING_SUPERVISOR,
  护理人员: ROLE_KEYS.NURSING_STAFF,
  护理员: ROLE_KEYS.NURSING_STAFF,
  前台人员: ROLE_KEYS.FRONT_DESK,
  健康管家: ROLE_KEYS.FRONT_DESK,
  膳食管理员: ROLE_KEYS.MEAL_MANAGER,
}

export function resolveRoleKey(roleName?: string | null): RoleKey {
  const normalized = roleName?.trim()

  if (!normalized) {
    return ROLE_KEYS.FRONT_DESK
  }

  return legacyRoleMap[normalized] ?? ROLE_KEYS.FRONT_DESK
}

export function toActor<T extends Omit<Actor, 'roleKey'>>(profile: T): Actor {
  return {
    ...profile,
    roleKey: resolveRoleKey(profile.roleName),
  }
}

export function hasRole(actor: Actor, roles: RoleKey[]) {
  return roles.includes(actor.roleKey)
}

export function assertRole(actor: Actor, roles: RoleKey[], message = '无权执行当前操作') {
  if (!hasRole(actor, roles)) {
    throw new ForbiddenException(message)
  }
}

export function isAdmin(actor: Actor) {
  return actor.roleKey === ROLE_KEYS.ADMIN
}

export function isNursingSupervisor(actor: Actor) {
  return actor.roleKey === ROLE_KEYS.NURSING_SUPERVISOR
}

export function isNursingStaff(actor: Actor) {
  return actor.roleKey === ROLE_KEYS.NURSING_STAFF
}

export function isFrontDesk(actor: Actor) {
  return actor.roleKey === ROLE_KEYS.FRONT_DESK
}

export function isMealManager(actor: Actor) {
  return actor.roleKey === ROLE_KEYS.MEAL_MANAGER
}
