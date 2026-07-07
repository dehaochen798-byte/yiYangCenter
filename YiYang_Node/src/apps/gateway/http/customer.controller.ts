import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
} from '../../../modules/customer/dto/customer.dto.js'

@Controller('customer')
@UseGuards(GatewayJwtGuard)
export class CustomerController {
  constructor(private readonly gatewayClient: GatewayServiceClient) {}

  @Get('modules')
  getModules() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.customerModules,
      undefined
    )
  }

  @Get('overview')
  getOverview() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.customerOverview,
      undefined
    )
  }

  @Get('residents')
  listResidents() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.residentsList,
      undefined
    )
  }

  @Post('residents')
  createResident(@Body() body: SaveResidentDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.residentsCreate,
      body
    )
  }

  @Patch('residents/:id')
  updateResident(@Param('id') id: string, @Body() body: SaveResidentDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.residentsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('users')
  listUsers() {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.usersList, undefined)
  }

  @Post('users')
  createUser(@Body() body: SaveUserDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.usersCreate, body)
  }

  @Patch('users/:id/reset-password')
  resetUserPassword(@Param('id') id: string) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.usersResetPassword,
      {
        id: Number(id),
      }
    )
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: SaveUserDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.usersUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('rooms')
  listRooms() {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.roomsList, undefined)
  }

  @Post('rooms')
  createRoom(@Body() body: SaveRoomDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.roomsCreate, body)
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() body: SaveRoomDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.roomsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('beds')
  listBeds() {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.bedsList, undefined)
  }

  @Post('beds')
  createBed(@Body() body: SaveBedDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.bedsCreate, body)
  }

  @Patch('beds/:id')
  updateBed(@Param('id') id: string, @Body() body: SaveBedDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.bedsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Delete('beds/:id')
  deleteBed(@Param('id') id: string) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.bedsDelete, {
      id: Number(id),
    })
  }

  @Get('meal-plans')
  listMealPlans() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealPlansList,
      undefined
    )
  }

  @Post('meal-plans')
  createMealPlan(@Body() body: SaveMealPlanDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealPlansCreate,
      body
    )
  }

  @Patch('meal-plans/:id')
  updateMealPlan(@Param('id') id: string, @Body() body: SaveMealPlanDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.mealPlansUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Delete('meal-plans/:id')
  deleteMealPlan(@Param('id') id: string) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.mealPlansDelete, {
      id: Number(id),
    })
  }

  @Get('meal-calendars')
  listMealCalendars() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsList,
      undefined
    )
  }

  @Post('meal-calendars')
  createMealCalendar(@Body() body: SaveMealCalendarDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsCreate,
      body
    )
  }

  @Patch('meal-calendars/:id')
  updateMealCalendar(@Param('id') id: string, @Body() body: SaveMealCalendarDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsUpdate,
      {
        id: Number(id),
        data: body,
      }
    )
  }

  @Delete('meal-calendars/:id')
  deleteMealCalendar(@Param('id') id: string) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.mealCalendarsDelete,
      {
        id: Number(id),
      }
    )
  }

  @Get('check-ins')
  listCheckIns() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkInsList,
      undefined
    )
  }

  @Post('check-ins')
  createCheckIn(@Body() body: CreateCheckInDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.checkInsCreate, body)
  }

  @Get('check-outs')
  listCheckOuts() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkOutsList,
      undefined
    )
  }

  @Post('check-outs')
  createCheckOut(@Body() body: CreateCheckOutDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.checkOutsCreate,
      body
    )
  }

  @Get('outings')
  listOutings() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.outingsList,
      undefined
    )
  }

  @Post('outings')
  createOuting(@Body() body: CreateOutingDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.outingsCreate, body)
  }

  @Patch('outings/:id/return')
  returnOuting(@Param('id') id: string, @Body() body: ReturnOutingDto) {
    return this.gatewayClient.send(SERVICE_NAMES.care, CARE_PATTERNS.outingsReturn, {
      id: Number(id),
      data: body,
    })
  }

  @Get('service-targets')
  listServiceTargets() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceTargetsList,
      undefined
    )
  }

  @Post('service-targets')
  createServiceTarget(@Body() body: SaveServiceTargetDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceTargetsCreate,
      body
    )
  }

  @Patch('service-targets/:id')
  updateServiceTarget(@Param('id') id: string, @Body() body: SaveServiceTargetDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceTargetsUpdate,
      {
        id: Number(id),
        data: body,
      }
    )
  }

  @Get('service-focuses')
  listServiceFocuses() {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceFocusesList,
      undefined
    )
  }

  @Post('service-focuses')
  createServiceFocus(@Body() body: SaveServiceFocusDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceFocusesCreate,
      body
    )
  }

  @Patch('service-focuses/:id')
  updateServiceFocus(@Param('id') id: string, @Body() body: SaveServiceFocusDto) {
    return this.gatewayClient.send(
      SERVICE_NAMES.care,
      CARE_PATTERNS.serviceFocusesUpdate,
      {
        id: Number(id),
        data: body,
      }
    )
  }
}
