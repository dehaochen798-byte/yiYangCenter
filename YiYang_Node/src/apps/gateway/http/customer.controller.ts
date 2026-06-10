import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { GatewayJwtGuard } from '../security/gateway-jwt.guard.js'
import { sendTcpMessage } from '../../../libs/microservices/client-proxy.util.js'
import { CARE_PATTERNS } from '../../../libs/contracts/care.contract.js'
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
  constructor(@Inject('CARE_SERVICE') private readonly careClient: ClientProxy) {}

  @Get('modules')
  getModules() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.customerModules, undefined)
  }

  @Get('overview')
  getOverview() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.customerOverview, undefined)
  }

  @Get('residents')
  listResidents() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.residentsList, undefined)
  }

  @Post('residents')
  createResident(@Body() body: SaveResidentDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.residentsCreate, body)
  }

  @Patch('residents/:id')
  updateResident(@Param('id') id: string, @Body() body: SaveResidentDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.residentsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('users')
  listUsers() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.usersList, undefined)
  }

  @Post('users')
  createUser(@Body() body: SaveUserDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.usersCreate, body)
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: SaveUserDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.usersUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('rooms')
  listRooms() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.roomsList, undefined)
  }

  @Post('rooms')
  createRoom(@Body() body: SaveRoomDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.roomsCreate, body)
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() body: SaveRoomDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.roomsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('beds')
  listBeds() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.bedsList, undefined)
  }

  @Post('beds')
  createBed(@Body() body: SaveBedDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.bedsCreate, body)
  }

  @Patch('beds/:id')
  updateBed(@Param('id') id: string, @Body() body: SaveBedDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.bedsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Delete('beds/:id')
  deleteBed(@Param('id') id: string) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.bedsDelete, { id: Number(id) })
  }

  @Get('meal-plans')
  listMealPlans() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.mealPlansList, undefined)
  }

  @Post('meal-plans')
  createMealPlan(@Body() body: SaveMealPlanDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.mealPlansCreate, body)
  }

  @Patch('meal-plans/:id')
  updateMealPlan(@Param('id') id: string, @Body() body: SaveMealPlanDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.mealPlansUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('meal-calendars')
  listMealCalendars() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.mealCalendarsList, undefined)
  }

  @Post('meal-calendars')
  createMealCalendar(@Body() body: SaveMealCalendarDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.mealCalendarsCreate, body)
  }

  @Patch('meal-calendars/:id')
  updateMealCalendar(@Param('id') id: string, @Body() body: SaveMealCalendarDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.mealCalendarsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('check-ins')
  listCheckIns() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.checkInsList, undefined)
  }

  @Post('check-ins')
  createCheckIn(@Body() body: CreateCheckInDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.checkInsCreate, body)
  }

  @Get('check-outs')
  listCheckOuts() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.checkOutsList, undefined)
  }

  @Post('check-outs')
  createCheckOut(@Body() body: CreateCheckOutDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.checkOutsCreate, body)
  }

  @Get('outings')
  listOutings() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.outingsList, undefined)
  }

  @Post('outings')
  createOuting(@Body() body: CreateOutingDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.outingsCreate, body)
  }

  @Patch('outings/:id/return')
  returnOuting(@Param('id') id: string, @Body() body: ReturnOutingDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.outingsReturn, {
      id: Number(id),
      data: body,
    })
  }

  @Get('service-targets')
  listServiceTargets() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.serviceTargetsList, undefined)
  }

  @Post('service-targets')
  createServiceTarget(@Body() body: SaveServiceTargetDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.serviceTargetsCreate, body)
  }

  @Patch('service-targets/:id')
  updateServiceTarget(@Param('id') id: string, @Body() body: SaveServiceTargetDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.serviceTargetsUpdate, {
      id: Number(id),
      data: body,
    })
  }

  @Get('service-focuses')
  listServiceFocuses() {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.serviceFocusesList, undefined)
  }

  @Post('service-focuses')
  createServiceFocus(@Body() body: SaveServiceFocusDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.serviceFocusesCreate, body)
  }

  @Patch('service-focuses/:id')
  updateServiceFocus(@Param('id') id: string, @Body() body: SaveServiceFocusDto) {
    return sendTcpMessage(this.careClient, CARE_PATTERNS.serviceFocusesUpdate, {
      id: Number(id),
      data: body,
    })
  }
}
