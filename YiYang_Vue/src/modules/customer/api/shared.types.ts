export type Gender = 'MALE' | 'FEMALE'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type BedStatus = 'VACANT' | 'OCCUPIED' | 'DISABLED'
export type ResidenceStatus = 'PENDING' | 'ACTIVE' | 'CHECKED_OUT'
export type OutingStatus = 'PENDING' | 'OUTING' | 'RETURNED'
export type ServiceFocusStatus = 'ACTIVE' | 'PAUSED' | 'ENDED'

export interface CareLevelOption {
  id: number
  code: string
  name: string
  description?: string | null
  isActive: boolean
}
