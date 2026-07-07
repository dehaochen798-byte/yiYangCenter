import { ForbiddenException } from '@nestjs/common'
import { ROLE_KEYS, type Actor, type RoleKey } from '../../../common/rbac/rbac.types.js'

export const gatewayRoleMatrix = {
  dashboard: [
    ROLE_KEYS.ADMIN,
    ROLE_KEYS.NURSING_SUPERVISOR,
    ROLE_KEYS.NURSING_STAFF,
    ROLE_KEYS.FRONT_DESK,
    ROLE_KEYS.MEAL_MANAGER,
  ],
  residentReadAll: [
    ROLE_KEYS.ADMIN,
    ROLE_KEYS.NURSING_SUPERVISOR,
    ROLE_KEYS.FRONT_DESK,
    ROLE_KEYS.MEAL_MANAGER,
  ],
  residentReadAssigned: [ROLE_KEYS.NURSING_STAFF],
  residentWrite: [ROLE_KEYS.ADMIN],
  userAdmin: [ROLE_KEYS.ADMIN],
  roomBedBiz: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK],
  mealBiz: [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER],
  serviceTargetAdmin: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR],
  serviceFocusWrite: [ROLE_KEYS.ADMIN],
  serviceFocusReadAssigned: [ROLE_KEYS.NURSING_STAFF],
  nursingAdmin: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR],
  nursingReadAssigned: [ROLE_KEYS.NURSING_STAFF],
} satisfies Record<string, RoleKey[]>

export function assertGatewayRole(actor: Actor, roles: RoleKey[], message = '无权访问当前接口') {
  if (!roles.includes(actor.roleKey)) {
    throw new ForbiddenException(message)
  }
}
