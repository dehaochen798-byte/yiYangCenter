import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
import { SERVICE_NAMES } from '../../../libs/registry/registry.types.js'
import { GatewayServiceClient } from '../services/gateway-service-client.js'
import {
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
  UpdateCheckInDto,
  UpdateCheckOutDto,
} from '../../../modules/customer/dto/customer.dto.js'
import type { Actor } from '../../../common/rbac/rbac.types.js'
import {
  assertGatewayRole,
  gatewayRoleMatrix,
} from '../security/gateway-rbac.util.js'

type GatewayRequest = { user: Actor }

@Controller('customer')
@UseGuards(GatewayJwtGuard)
export class CustomerController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Get('modules')
  getModules(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.dashboard)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.customerModules,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Get('overview')
  getOverview(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.dashboard)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.customerOverview,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Get('residents')
  listResidents(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.residentReadAll,
      ...gatewayRoleMatrix.residentReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.residentsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('residents')
  createResident(@Req() request: GatewayRequest, @Body() body: SaveResidentDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.residentWrite)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.residentsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('residents/:id')
  updateResident(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveResidentDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.residentWrite)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.residentsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('users')
  listUsers(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.userAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.usersList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('users')
  createUser(@Req() request: GatewayRequest, @Body() body: SaveUserDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.userAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.usersCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('users/:id/reset-password')
  resetUserPassword(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.userAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.usersResetPassword,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }

  @Patch('users/:id')
  updateUser(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveUserDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.userAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.usersUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('rooms')
  listRooms(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.roomsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('rooms')
  createRoom(@Req() request: GatewayRequest, @Body() body: SaveRoomDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.roomsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('rooms/:id')
  updateRoom(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveRoomDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.roomsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('beds')
  listBeds(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.bedsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('beds')
  createBed(@Req() request: GatewayRequest, @Body() body: SaveBedDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.bedsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('beds/:id')
  updateBed(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveBedDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.bedsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Delete('beds/:id')
  deleteBed(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.bedsDelete,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }

  @Get('meal-plans')
  listMealPlans(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealPlansList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('meal-plans')
  createMealPlan(@Req() request: GatewayRequest, @Body() body: SaveMealPlanDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealPlansCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('meal-plans/:id')
  updateMealPlan(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveMealPlanDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealPlansUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Delete('meal-plans/:id')
  deleteMealPlan(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealPlansDelete,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }

  @Get('meal-calendars')
  listMealCalendars(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('meal-calendars')
  createMealCalendar(
    @Req() request: GatewayRequest,
    @Body() body: SaveMealCalendarDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('meal-calendars/:id')
  updateMealCalendar(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveMealCalendarDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Delete('meal-calendars/:id')
  deleteMealCalendar(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.mealBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsDelete,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }

  @Get('check-ins')
  listCheckIns(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkInsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('check-ins')
  createCheckIn(@Req() request: GatewayRequest, @Body() body: CreateCheckInDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkInsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('check-ins/:id')
  updateCheckIn(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: UpdateCheckInDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkInsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Delete('check-ins/:id')
  deleteCheckIn(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkInsDelete,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }

  @Get('check-outs')
  listCheckOuts(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkOutsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('check-outs')
  createCheckOut(@Req() request: GatewayRequest, @Body() body: CreateCheckOutDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkOutsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('check-outs/:id')
  updateCheckOut(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: UpdateCheckOutDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkOutsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Delete('check-outs/:id')
  deleteCheckOut(@Req() request: GatewayRequest, @Param('id') id: string) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkOutsDelete,
      this.gatewayClient.withActorAndId(request.user, Number(id))
    )
  }

  @Get('outings')
  listOutings(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.outingsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('outings')
  createOuting(@Req() request: GatewayRequest, @Body() body: CreateOutingDto) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.outingsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('outings/:id/return')
  returnOuting(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: ReturnOutingDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.roomBedBiz)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.outingsReturn,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('service-targets')
  listServiceTargets(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, gatewayRoleMatrix.serviceTargetAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceTargetsList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('service-targets')
  createServiceTarget(
    @Req() request: GatewayRequest,
    @Body() body: SaveServiceTargetDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.serviceTargetAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceTargetsCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('service-targets/:id')
  updateServiceTarget(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveServiceTargetDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.serviceTargetAdmin)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceTargetsUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }

  @Get('service-focuses')
  listServiceFocuses(@Req() request: GatewayRequest) {
    assertGatewayRole(request.user, [
      ...gatewayRoleMatrix.serviceFocusWrite,
      ...gatewayRoleMatrix.serviceFocusReadAssigned,
    ])
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceFocusesList,
      this.gatewayClient.withActorOnly(request.user)
    )
  }

  @Post('service-focuses')
  createServiceFocus(
    @Req() request: GatewayRequest,
    @Body() body: SaveServiceFocusDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.serviceFocusWrite)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceFocusesCreate,
      this.gatewayClient.withActor(request.user, body)
    )
  }

  @Patch('service-focuses/:id')
  updateServiceFocus(
    @Req() request: GatewayRequest,
    @Param('id') id: string,
    @Body() body: SaveServiceFocusDto
  ) {
    assertGatewayRole(request.user, gatewayRoleMatrix.serviceFocusWrite)
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceFocusesUpdate,
      this.gatewayClient.withActorAndUpdate(request.user, Number(id), body)
    )
  }
}
