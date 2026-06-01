import { request } from '@/api/request'

export type Gender = 'MALE' | 'FEMALE'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type BedStatus = 'VACANT' | 'OCCUPIED' | 'DISABLED'
export type ResidenceStatus = 'PENDING' | 'ACTIVE' | 'CHECKED_OUT'
export type OutingStatus = 'PENDING' | 'OUTING' | 'RETURNED'
export type ServiceFocusStatus = 'ACTIVE' | 'PAUSED' | 'ENDED'

export interface UserItem {
  id: number
  mobile: string
  realName: string
  nickName: string
  age: number
  gender: Gender
  status: UserStatus
  roleName?: string | null
  departmentName?: string | null
  createdAt: string
  updatedAt: string
}

export interface CareLevelOption {
  id: number
  code: string
  name: string
  description?: string | null
  isActive: boolean
}

export interface RoomItem {
  id: number
  building?: string | null
  roomNo: string
  floor: number
  roomType?: string | null
  bedCount: number
  description?: string | null
  isActive: boolean
  beds?: BedItem[]
}

export interface BedItem {
  id: number
  roomId: number
  bedNo: string
  label?: string | null
  status: BedStatus
  createdAt?: string
  updatedAt?: string
  room?: RoomItem
  currentResident?: ResidentItem | null
}

export interface ResidentItem {
  id: number
  fullName: string
  age: number
  gender: Gender
  phone: string
  idCard?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  status: ResidenceStatus
  note?: string | null
  currentBedId?: number | null
  careLevelId?: number | null
  currentBed?: BedItem | null
  careLevel?: CareLevelOption | null
  createdAt?: string
  updatedAt?: string
}

export interface MealPlanItem {
  id: number
  residentId: number
  title: string
  description?: string | null
  dietaryRestrictions?: string | null
  allergens?: string | null
  nutritionTags?: string | null
  startDate?: string | null
  endDate?: string | null
  resident?: ResidentItem
}

export interface MealCalendarItem {
  id: number
  campus?: string | null
  weekLabel: string
  weekStartDate: string
  monday?: string | null
  tuesday?: string | null
  wednesday?: string | null
  thursday?: string | null
  friday?: string | null
  saturday?: string | null
  sunday?: string | null
}

export interface CheckInItem {
  id: number
  residentId: number
  bedId: number
  checkInAt: string
  note?: string | null
  resident?: ResidentItem
  bed?: BedItem
}

export interface CheckOutItem {
  id: number
  residentId: number
  bedId?: number | null
  checkOutAt: string
  reason?: string | null
  handoverNote?: string | null
  resident?: ResidentItem
  bed?: BedItem | null
}

export interface OutingItem {
  id: number
  residentId: number
  startAt: string
  expectedReturnAt?: string | null
  actualReturnAt?: string | null
  destination?: string | null
  reason?: string | null
  status: OutingStatus
  resident?: ResidentItem
}

export interface ServiceTargetItem {
  id: number
  residentId: number
  managerUserId?: number | null
  managerName: string
  managerMobile: string
  startDate?: string | null
  endDate?: string | null
  relationNote?: string | null
  resident?: ResidentItem
  managerUser?: UserItem | null
}

export interface ServiceFocusItem {
  id: number
  residentId: number
  serviceName: string
  detail?: string | null
  serviceStartAt?: string | null
  serviceEndAt?: string | null
  status: ServiceFocusStatus
  resident?: ResidentItem
}

export interface CustomerOverview {
  residentCount: number
  activeResidentCount: number
  occupiedBedCount: number
  vacantBedCount: number
}

export function getCustomerOverview() {
  return request<CustomerOverview>({
    url: '/api/customer/overview',
  })
}

export function getResidents() {
  return request<ResidentItem[]>({
    url: '/api/customer/residents',
  })
}

export function createResident(data: Partial<ResidentItem>) {
  return request<ResidentItem>({
    url: '/api/customer/residents',
    method: 'post',
    data,
  })
}

export function updateResident(id: number, data: Partial<ResidentItem>) {
  return request<ResidentItem>({
    url: `/api/customer/residents/${id}`,
    method: 'patch',
    data,
  })
}

export function getUsers() {
  return request<UserItem[]>({
    url: '/api/customer/users',
  })
}

export function createUser(data: Partial<UserItem>) {
  return request<UserItem>({
    url: '/api/customer/users',
    method: 'post',
    data,
  })
}

export function updateUser(id: number, data: Partial<UserItem>) {
  return request<UserItem>({
    url: `/api/customer/users/${id}`,
    method: 'patch',
    data,
  })
}

export function getRooms() {
  return request<RoomItem[]>({
    url: '/api/customer/rooms',
  })
}

export function createRoom(data: Partial<RoomItem>) {
  return request<RoomItem>({
    url: '/api/customer/rooms',
    method: 'post',
    data,
  })
}

export function updateRoom(id: number, data: Partial<RoomItem>) {
  return request<RoomItem>({
    url: `/api/customer/rooms/${id}`,
    method: 'patch',
    data,
  })
}

export function getBeds() {
  return request<BedItem[]>({
    url: '/api/customer/beds',
  })
}

export function createBed(data: Partial<BedItem>) {
  return request<BedItem>({
    url: '/api/customer/beds',
    method: 'post',
    data,
  })
}

export function updateBed(id: number, data: Partial<BedItem>) {
  return request<BedItem>({
    url: `/api/customer/beds/${id}`,
    method: 'patch',
    data,
  })
}

export function getMealPlans() {
  return request<MealPlanItem[]>({
    url: '/api/customer/meal-plans',
  })
}

export function createMealPlan(data: Partial<MealPlanItem>) {
  return request<MealPlanItem>({
    url: '/api/customer/meal-plans',
    method: 'post',
    data,
  })
}

export function updateMealPlan(id: number, data: Partial<MealPlanItem>) {
  return request<MealPlanItem>({
    url: `/api/customer/meal-plans/${id}`,
    method: 'patch',
    data,
  })
}

export function getMealCalendars() {
  return request<MealCalendarItem[]>({
    url: '/api/customer/meal-calendars',
  })
}

export function createMealCalendar(data: Partial<MealCalendarItem>) {
  return request<MealCalendarItem>({
    url: '/api/customer/meal-calendars',
    method: 'post',
    data,
  })
}

export function updateMealCalendar(id: number, data: Partial<MealCalendarItem>) {
  return request<MealCalendarItem>({
    url: `/api/customer/meal-calendars/${id}`,
    method: 'patch',
    data,
  })
}

export function getCheckIns() {
  return request<CheckInItem[]>({
    url: '/api/customer/check-ins',
  })
}

export function createCheckIn(data: Partial<CheckInItem>) {
  return request<CheckInItem>({
    url: '/api/customer/check-ins',
    method: 'post',
    data,
  })
}

export function getCheckOuts() {
  return request<CheckOutItem[]>({
    url: '/api/customer/check-outs',
  })
}

export function createCheckOut(data: Partial<CheckOutItem>) {
  return request<CheckOutItem>({
    url: '/api/customer/check-outs',
    method: 'post',
    data,
  })
}

export function getOutings() {
  return request<OutingItem[]>({
    url: '/api/customer/outings',
  })
}

export function createOuting(data: Partial<OutingItem>) {
  return request<OutingItem>({
    url: '/api/customer/outings',
    method: 'post',
    data,
  })
}

export function returnOuting(id: number, data: { actualReturnAt: string }) {
  return request<OutingItem>({
    url: `/api/customer/outings/${id}/return`,
    method: 'patch',
    data,
  })
}

export function getServiceTargets() {
  return request<ServiceTargetItem[]>({
    url: '/api/customer/service-targets',
  })
}

export function createServiceTarget(data: Partial<ServiceTargetItem>) {
  return request<ServiceTargetItem>({
    url: '/api/customer/service-targets',
    method: 'post',
    data,
  })
}

export function updateServiceTarget(id: number, data: Partial<ServiceTargetItem>) {
  return request<ServiceTargetItem>({
    url: `/api/customer/service-targets/${id}`,
    method: 'patch',
    data,
  })
}

export function getServiceFocuses() {
  return request<ServiceFocusItem[]>({
    url: '/api/customer/service-focuses',
  })
}

export function createServiceFocus(data: Partial<ServiceFocusItem>) {
  return request<ServiceFocusItem>({
    url: '/api/customer/service-focuses',
    method: 'post',
    data,
  })
}

export function updateServiceFocus(id: number, data: Partial<ServiceFocusItem>) {
  return request<ServiceFocusItem>({
    url: `/api/customer/service-focuses/${id}`,
    method: 'patch',
    data,
  })
}
