import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import { DashboardService } from '../../../modules/dashboard/dashboard.service.js'
import { CustomerService } from '../../../modules/customer/customer.service.js'
import { NursingService } from '../../../modules/nursing/nursing.service.js'
import type {
  CreateCheckInDto,
  CreateCheckOutDto,
  CreateOutingDto,
  ReturnOutingDto,
  SaveBedDto,
  SaveMealCalendarDto,
  SaveMealPlanDto,
  SaveResidentDto,
  SaveRoomDto,
  SaveServiceFocusDto,
  SaveServiceTargetDto,
  SaveUserDto,
} from '../../../modules/customer/dto/customer.dto.js'
import type {
  GenerateCareRecordNoteDto,
  SaveCareItemDto,
  SaveCareLevelDto,
  SaveCareRecordDto,
} from '../../../modules/nursing/dto/nursing.dto.js'

@Controller()
export class CareMessageController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly customerService: CustomerService,
    private readonly nursingService: NursingService
  ) {}

  @MessagePattern(CARE_PATTERNS.dashboardSummary)
  getDashboardSummary() {
    return this.dashboardService.getSummary()
  }

  @MessagePattern(CARE_PATTERNS.customerModules)
  getCustomerModules() {
    return this.customerService.getModules()
  }

  @MessagePattern(CARE_PATTERNS.customerOverview)
  getCustomerOverview() {
    return this.customerService.getOverview()
  }

  @MessagePattern(CARE_PATTERNS.residentsList)
  listResidents() {
    return this.customerService.listResidents()
  }

  @MessagePattern(CARE_PATTERNS.residentsCreate)
  createResident(payload: SaveResidentDto) {
    return this.customerService.createResident(payload)
  }

  @MessagePattern(CARE_PATTERNS.residentsUpdate)
  updateResident(payload: { id: number; data: SaveResidentDto }) {
    return this.customerService.updateResident(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.usersList)
  listUsers() {
    return this.customerService.listUsers()
  }

  @MessagePattern(CARE_PATTERNS.usersCreate)
  createUser(payload: SaveUserDto) {
    return this.customerService.createUser(payload)
  }

  @MessagePattern(CARE_PATTERNS.usersUpdate)
  updateUser(payload: { id: number; data: SaveUserDto }) {
    return this.customerService.updateUser(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.usersResetPassword)
  resetUserPassword(payload: { id: number }) {
    return this.customerService.resetUserPassword(payload.id)
  }

  @MessagePattern(CARE_PATTERNS.roomsList)
  listRooms() {
    return this.customerService.listRooms()
  }

  @MessagePattern(CARE_PATTERNS.roomsCreate)
  createRoom(payload: SaveRoomDto) {
    return this.customerService.createRoom(payload)
  }

  @MessagePattern(CARE_PATTERNS.roomsUpdate)
  updateRoom(payload: { id: number; data: SaveRoomDto }) {
    return this.customerService.updateRoom(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.bedsList)
  listBeds() {
    return this.customerService.listBeds()
  }

  @MessagePattern(CARE_PATTERNS.bedsCreate)
  createBed(payload: SaveBedDto) {
    return this.customerService.createBed(payload)
  }

  @MessagePattern(CARE_PATTERNS.bedsUpdate)
  updateBed(payload: { id: number; data: SaveBedDto }) {
    return this.customerService.updateBed(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.bedsDelete)
  deleteBed(payload: { id: number }) {
    return this.customerService.deleteBed(payload.id)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansList)
  listMealPlans() {
    return this.customerService.listMealPlans()
  }

  @MessagePattern(CARE_PATTERNS.mealPlansCreate)
  createMealPlan(payload: SaveMealPlanDto) {
    return this.customerService.createMealPlan(payload)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansUpdate)
  updateMealPlan(payload: { id: number; data: SaveMealPlanDto }) {
    return this.customerService.updateMealPlan(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansDelete)
  deleteMealPlan(payload: { id: number }) {
    return this.customerService.deleteMealPlan(payload.id)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsList)
  listMealCalendars() {
    return this.customerService.listMealCalendars()
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsCreate)
  createMealCalendar(payload: SaveMealCalendarDto) {
    return this.customerService.createMealCalendar(payload)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsUpdate)
  updateMealCalendar(payload: { id: number; data: SaveMealCalendarDto }) {
    return this.customerService.updateMealCalendar(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsDelete)
  deleteMealCalendar(payload: { id: number }) {
    return this.customerService.deleteMealCalendar(payload.id)
  }

  @MessagePattern(CARE_PATTERNS.checkInsList)
  listCheckIns() {
    return this.customerService.listCheckIns()
  }

  @MessagePattern(CARE_PATTERNS.checkInsCreate)
  createCheckIn(payload: CreateCheckInDto) {
    return this.customerService.createCheckIn(payload)
  }

  @MessagePattern(CARE_PATTERNS.checkOutsList)
  listCheckOuts() {
    return this.customerService.listCheckOuts()
  }

  @MessagePattern(CARE_PATTERNS.checkOutsCreate)
  createCheckOut(payload: CreateCheckOutDto) {
    return this.customerService.createCheckOut(payload)
  }

  @MessagePattern(CARE_PATTERNS.outingsList)
  listOutings() {
    return this.customerService.listOutings()
  }

  @MessagePattern(CARE_PATTERNS.outingsCreate)
  createOuting(payload: CreateOutingDto) {
    return this.customerService.createOuting(payload)
  }

  @MessagePattern(CARE_PATTERNS.outingsReturn)
  returnOuting(payload: { id: number; data: ReturnOutingDto }) {
    return this.customerService.returnOuting(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.serviceTargetsList)
  listServiceTargets() {
    return this.customerService.listServiceTargets()
  }

  @MessagePattern(CARE_PATTERNS.serviceTargetsCreate)
  createServiceTarget(payload: SaveServiceTargetDto) {
    return this.customerService.createServiceTarget(payload)
  }

  @MessagePattern(CARE_PATTERNS.serviceTargetsUpdate)
  updateServiceTarget(payload: { id: number; data: SaveServiceTargetDto }) {
    return this.customerService.updateServiceTarget(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.serviceFocusesList)
  listServiceFocuses() {
    return this.customerService.listServiceFocuses()
  }

  @MessagePattern(CARE_PATTERNS.serviceFocusesCreate)
  createServiceFocus(payload: SaveServiceFocusDto) {
    return this.customerService.createServiceFocus(payload)
  }

  @MessagePattern(CARE_PATTERNS.serviceFocusesUpdate)
  updateServiceFocus(payload: { id: number; data: SaveServiceFocusDto }) {
    return this.customerService.updateServiceFocus(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.nursingModules)
  getNursingModules() {
    return this.nursingService.getModules()
  }

  @MessagePattern(CARE_PATTERNS.careLevelsList)
  listCareLevels() {
    return this.nursingService.listCareLevels()
  }

  @MessagePattern(CARE_PATTERNS.careLevelsCreate)
  createCareLevel(payload: SaveCareLevelDto) {
    return this.nursingService.createCareLevel(payload)
  }

  @MessagePattern(CARE_PATTERNS.careLevelsUpdate)
  updateCareLevel(payload: { id: number; data: SaveCareLevelDto }) {
    return this.nursingService.updateCareLevel(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careItemsList)
  listCareItems() {
    return this.nursingService.listCareItems()
  }

  @MessagePattern(CARE_PATTERNS.careItemsCreate)
  createCareItem(payload: SaveCareItemDto) {
    return this.nursingService.createCareItem(payload)
  }

  @MessagePattern(CARE_PATTERNS.careItemsUpdate)
  updateCareItem(payload: { id: number; data: SaveCareItemDto }) {
    return this.nursingService.updateCareItem(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsList)
  listCareRecords() {
    return this.nursingService.listCareRecords()
  }

  @MessagePattern(CARE_PATTERNS.careRecordsCreate)
  createCareRecord(payload: SaveCareRecordDto) {
    return this.nursingService.createCareRecord(payload)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsGenerateAiNote)
  generateCareRecordAiNote(payload: GenerateCareRecordNoteDto) {
    return this.nursingService.generateCareRecordAiNote(payload)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsUpdate)
  updateCareRecord(payload: { id: number; data: SaveCareRecordDto }) {
    return this.nursingService.updateCareRecord(payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsDelete)
  deleteCareRecord(payload: { id: number }) {
    return this.nursingService.deleteCareRecord(payload.id)
  }
}
