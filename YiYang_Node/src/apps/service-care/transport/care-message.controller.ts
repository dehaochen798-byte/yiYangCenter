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
import type {
  ActorOnlyPayload,
  ActorIdPayload,
  ActorPayload,
  ActorUpdatePayload,
} from '../../../common/rbac/rbac.types.js'

@Controller()
export class CareMessageController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly customerService: CustomerService,
    private readonly nursingService: NursingService
  ) {}

  @MessagePattern(CARE_PATTERNS.dashboardSummary)
  getDashboardSummary(payload: ActorOnlyPayload) {
    return this.dashboardService.getSummary(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.customerModules)
  getCustomerModules(payload: ActorOnlyPayload) {
    return this.customerService.getModules(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.customerOverview)
  getCustomerOverview(payload: ActorOnlyPayload) {
    return this.customerService.getOverview(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.residentsList)
  listResidents(payload: ActorOnlyPayload) {
    return this.customerService.listResidents(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.residentsCreate)
  createResident(payload: ActorPayload<SaveResidentDto>) {
    return this.customerService.createResident(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.residentsUpdate)
  updateResident(payload: ActorUpdatePayload<SaveResidentDto>) {
    return this.customerService.updateResident(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.usersList)
  listUsers(payload: ActorOnlyPayload) {
    return this.customerService.listUsers(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.usersCreate)
  createUser(payload: ActorPayload<SaveUserDto>) {
    return this.customerService.createUser(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.usersUpdate)
  updateUser(payload: ActorUpdatePayload<SaveUserDto>) {
    return this.customerService.updateUser(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.usersResetPassword)
  resetUserPassword(payload: ActorIdPayload) {
    return this.customerService.resetUserPassword(payload.actor, payload.id)
  }

  @MessagePattern(CARE_PATTERNS.roomsList)
  listRooms(payload: ActorOnlyPayload) {
    return this.customerService.listRooms(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.roomsCreate)
  createRoom(payload: ActorPayload<SaveRoomDto>) {
    return this.customerService.createRoom(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.roomsUpdate)
  updateRoom(payload: ActorUpdatePayload<SaveRoomDto>) {
    return this.customerService.updateRoom(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.bedsList)
  listBeds(payload: ActorOnlyPayload) {
    return this.customerService.listBeds(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.bedsCreate)
  createBed(payload: ActorPayload<SaveBedDto>) {
    return this.customerService.createBed(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.bedsUpdate)
  updateBed(payload: ActorUpdatePayload<SaveBedDto>) {
    return this.customerService.updateBed(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.bedsDelete)
  deleteBed(payload: ActorIdPayload) {
    return this.customerService.deleteBed(payload.actor, payload.id)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansList)
  listMealPlans(payload: ActorOnlyPayload) {
    return this.customerService.listMealPlans(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansCreate)
  createMealPlan(payload: ActorPayload<SaveMealPlanDto>) {
    return this.customerService.createMealPlan(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansUpdate)
  updateMealPlan(payload: ActorUpdatePayload<SaveMealPlanDto>) {
    return this.customerService.updateMealPlan(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.mealPlansDelete)
  deleteMealPlan(payload: ActorIdPayload) {
    return this.customerService.deleteMealPlan(payload.actor, payload.id)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsList)
  listMealCalendars(payload: ActorOnlyPayload) {
    return this.customerService.listMealCalendars(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsCreate)
  createMealCalendar(payload: ActorPayload<SaveMealCalendarDto>) {
    return this.customerService.createMealCalendar(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsUpdate)
  updateMealCalendar(payload: ActorUpdatePayload<SaveMealCalendarDto>) {
    return this.customerService.updateMealCalendar(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.mealCalendarsDelete)
  deleteMealCalendar(payload: ActorIdPayload) {
    return this.customerService.deleteMealCalendar(payload.actor, payload.id)
  }

  @MessagePattern(CARE_PATTERNS.checkInsList)
  listCheckIns(payload: ActorOnlyPayload) {
    return this.customerService.listCheckIns(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.checkInsCreate)
  createCheckIn(payload: ActorPayload<CreateCheckInDto>) {
    return this.customerService.createCheckIn(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.checkInsDelete)
  deleteCheckIn(payload: ActorIdPayload) {
    return this.customerService.deleteCheckIn(payload.actor, payload.id)
  }

  @MessagePattern(CARE_PATTERNS.checkOutsList)
  listCheckOuts(payload: ActorOnlyPayload) {
    return this.customerService.listCheckOuts(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.checkOutsCreate)
  createCheckOut(payload: ActorPayload<CreateCheckOutDto>) {
    return this.customerService.createCheckOut(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.checkOutsDelete)
  deleteCheckOut(payload: ActorIdPayload) {
    return this.customerService.deleteCheckOut(payload.actor, payload.id)
  }

  @MessagePattern(CARE_PATTERNS.outingsList)
  listOutings(payload: ActorOnlyPayload) {
    return this.customerService.listOutings(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.outingsCreate)
  createOuting(payload: ActorPayload<CreateOutingDto>) {
    return this.customerService.createOuting(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.outingsReturn)
  returnOuting(payload: ActorUpdatePayload<ReturnOutingDto>) {
    return this.customerService.returnOuting(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.serviceTargetsList)
  listServiceTargets(payload: ActorOnlyPayload) {
    return this.customerService.listServiceTargets(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.serviceTargetsCreate)
  createServiceTarget(payload: ActorPayload<SaveServiceTargetDto>) {
    return this.customerService.createServiceTarget(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.serviceTargetsUpdate)
  updateServiceTarget(payload: ActorUpdatePayload<SaveServiceTargetDto>) {
    return this.customerService.updateServiceTarget(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.serviceFocusesList)
  listServiceFocuses(payload: ActorOnlyPayload) {
    return this.customerService.listServiceFocuses(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.serviceFocusesCreate)
  createServiceFocus(payload: ActorPayload<SaveServiceFocusDto>) {
    return this.customerService.createServiceFocus(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.serviceFocusesUpdate)
  updateServiceFocus(payload: ActorUpdatePayload<SaveServiceFocusDto>) {
    return this.customerService.updateServiceFocus(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.nursingModules)
  getNursingModules(payload: ActorOnlyPayload) {
    return this.nursingService.getModules(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.careLevelsList)
  listCareLevels(payload: ActorOnlyPayload) {
    return this.nursingService.listCareLevels(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.careLevelsCreate)
  createCareLevel(payload: ActorPayload<SaveCareLevelDto>) {
    return this.nursingService.createCareLevel(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careLevelsUpdate)
  updateCareLevel(payload: ActorUpdatePayload<SaveCareLevelDto>) {
    return this.nursingService.updateCareLevel(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careItemsList)
  listCareItems(payload: ActorOnlyPayload) {
    return this.nursingService.listCareItems(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.careItemsCreate)
  createCareItem(payload: ActorPayload<SaveCareItemDto>) {
    return this.nursingService.createCareItem(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careItemsUpdate)
  updateCareItem(payload: ActorUpdatePayload<SaveCareItemDto>) {
    return this.nursingService.updateCareItem(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsList)
  listCareRecords(payload: ActorOnlyPayload) {
    return this.nursingService.listCareRecords(payload.actor)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsCreate)
  createCareRecord(payload: ActorPayload<SaveCareRecordDto>) {
    return this.nursingService.createCareRecord(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsGenerateAiNote)
  generateCareRecordAiNote(payload: ActorPayload<GenerateCareRecordNoteDto>) {
    return this.nursingService.generateCareRecordAiNote(payload.actor, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsUpdate)
  updateCareRecord(payload: ActorUpdatePayload<SaveCareRecordDto>) {
    return this.nursingService.updateCareRecord(payload.actor, payload.id, payload.data)
  }

  @MessagePattern(CARE_PATTERNS.careRecordsDelete)
  deleteCareRecord(payload: ActorIdPayload) {
    return this.nursingService.deleteCareRecord(payload.actor, payload.id)
  }
}
