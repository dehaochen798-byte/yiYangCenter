import { ROLE_KEYS, hasRole, type RoleKey } from '@/constants/rbac'
import type { AuthProfile } from '@/modules/auth/api/auth.api'

export function getRoleKey(profile?: AuthProfile | null): RoleKey | undefined {
  return profile?.roleKey
}

export function canAccessRoles(profile: AuthProfile | null | undefined, roles?: RoleKey[]) {
  if (!roles || roles.length === 0) {
    return true
  }

  return hasRole(profile?.roleKey, roles)
}

export const roleGroups = {
  dashboard: [
    ROLE_KEYS.ADMIN,
    ROLE_KEYS.NURSING_SUPERVISOR,
    ROLE_KEYS.NURSING_STAFF,
    ROLE_KEYS.FRONT_DESK,
    ROLE_KEYS.MEAL_MANAGER,
  ],
  residentRead: [
    ROLE_KEYS.ADMIN,
    ROLE_KEYS.NURSING_SUPERVISOR,
    ROLE_KEYS.NURSING_STAFF,
    ROLE_KEYS.FRONT_DESK,
    ROLE_KEYS.MEAL_MANAGER,
  ],
  userAdmin: [ROLE_KEYS.ADMIN],
  nursingAdmin: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR],
  nursingRead: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR, ROLE_KEYS.NURSING_STAFF],
  roomBedBiz: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK],
  mealBiz: [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER],
  serviceTargetAdmin: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR],
  serviceFocusRead: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_STAFF],
} as const
