import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
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
} from './dto/customer.dto.js'
import { CustomerService } from './customer.service.js'
import type { Actor } from '../../common/rbac/rbac.types.js'

type AuthRequest = { user: Actor }

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('modules')
  getModules(@Req() request: AuthRequest) {
    return this.customerService.getModules(request.user)
  }

  @Get('overview')
  getOverview(@Req() request: AuthRequest) {
    return this.customerService.getOverview(request.user)
  }

  @Get('residents')
  listResidents(@Req() request: AuthRequest) {
    return this.customerService.listResidents(request.user)
  }

  @Post('residents')
  createResident(@Req() request: AuthRequest, @Body() body: SaveResidentDto) {
    return this.customerService.createResident(request.user, body)
  }

  @Patch('residents/:id')
  updateResident(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveResidentDto
  ) {
    return this.customerService.updateResident(request.user, Number(id), body)
  }

  @Get('users')
  listUsers(@Req() request: AuthRequest) {
    return this.customerService.listUsers(request.user)
  }

  @Post('users')
  createUser(@Req() request: AuthRequest, @Body() body: SaveUserDto) {
    return this.customerService.createUser(request.user, body)
  }

  @Patch('users/:id/reset-password')
  resetUserPassword(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.customerService.resetUserPassword(request.user, Number(id))
  }

  @Patch('users/:id')
  updateUser(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: SaveUserDto) {
    return this.customerService.updateUser(request.user, Number(id), body)
  }

  @Get('rooms')
  listRooms(@Req() request: AuthRequest) {
    return this.customerService.listRooms(request.user)
  }

  @Post('rooms')
  createRoom(@Req() request: AuthRequest, @Body() body: SaveRoomDto) {
    return this.customerService.createRoom(request.user, body)
  }

  @Patch('rooms/:id')
  updateRoom(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: SaveRoomDto) {
    return this.customerService.updateRoom(request.user, Number(id), body)
  }

  @Get('beds')
  listBeds(@Req() request: AuthRequest) {
    return this.customerService.listBeds(request.user)
  }

  @Post('beds')
  createBed(@Req() request: AuthRequest, @Body() body: SaveBedDto) {
    return this.customerService.createBed(request.user, body)
  }

  @Patch('beds/:id')
  updateBed(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: SaveBedDto) {
    return this.customerService.updateBed(request.user, Number(id), body)
  }

  @Get('meal-plans')
  listMealPlans(@Req() request: AuthRequest) {
    return this.customerService.listMealPlans(request.user)
  }

  @Post('meal-plans')
  createMealPlan(@Req() request: AuthRequest, @Body() body: SaveMealPlanDto) {
    return this.customerService.createMealPlan(request.user, body)
  }

  @Patch('meal-plans/:id')
  updateMealPlan(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveMealPlanDto
  ) {
    return this.customerService.updateMealPlan(request.user, Number(id), body)
  }

  @Delete('meal-plans/:id')
  deleteMealPlan(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.customerService.deleteMealPlan(request.user, Number(id))
  }

  @Get('meal-calendars')
  listMealCalendars(@Req() request: AuthRequest) {
    return this.customerService.listMealCalendars(request.user)
  }

  @Post('meal-calendars')
  createMealCalendar(@Req() request: AuthRequest, @Body() body: SaveMealCalendarDto) {
    return this.customerService.createMealCalendar(request.user, body)
  }

  @Patch('meal-calendars/:id')
  updateMealCalendar(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveMealCalendarDto
  ) {
    return this.customerService.updateMealCalendar(request.user, Number(id), body)
  }

  @Delete('meal-calendars/:id')
  deleteMealCalendar(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.customerService.deleteMealCalendar(request.user, Number(id))
  }

  @Get('check-ins')
  listCheckIns(@Req() request: AuthRequest) {
    return this.customerService.listCheckIns(request.user)
  }

  @Post('check-ins')
  createCheckIn(@Req() request: AuthRequest, @Body() body: CreateCheckInDto) {
    return this.customerService.createCheckIn(request.user, body)
  }

  @Patch('check-ins/:id')
  updateCheckIn(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: UpdateCheckInDto
  ) {
    return this.customerService.updateCheckIn(request.user, Number(id), body)
  }

  @Delete('check-ins/:id')
  deleteCheckIn(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.customerService.deleteCheckIn(request.user, Number(id))
  }

  @Get('check-outs')
  listCheckOuts(@Req() request: AuthRequest) {
    return this.customerService.listCheckOuts(request.user)
  }

  @Post('check-outs')
  createCheckOut(@Req() request: AuthRequest, @Body() body: CreateCheckOutDto) {
    return this.customerService.createCheckOut(request.user, body)
  }

  @Patch('check-outs/:id')
  updateCheckOut(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: UpdateCheckOutDto
  ) {
    return this.customerService.updateCheckOut(request.user, Number(id), body)
  }

  @Delete('check-outs/:id')
  deleteCheckOut(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.customerService.deleteCheckOut(request.user, Number(id))
  }

  @Get('outings')
  listOutings(@Req() request: AuthRequest) {
    return this.customerService.listOutings(request.user)
  }

  @Post('outings')
  createOuting(@Req() request: AuthRequest, @Body() body: CreateOutingDto) {
    return this.customerService.createOuting(request.user, body)
  }

  @Patch('outings/:id/return')
  returnOuting(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: ReturnOutingDto
  ) {
    return this.customerService.returnOuting(request.user, Number(id), body)
  }

  @Get('service-targets')
  listServiceTargets(@Req() request: AuthRequest) {
    return this.customerService.listServiceTargets(request.user)
  }

  @Post('service-targets')
  createServiceTarget(@Req() request: AuthRequest, @Body() body: SaveServiceTargetDto) {
    return this.customerService.createServiceTarget(request.user, body)
  }

  @Patch('service-targets/:id')
  updateServiceTarget(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveServiceTargetDto
  ) {
    return this.customerService.updateServiceTarget(request.user, Number(id), body)
  }

  @Get('service-focuses')
  listServiceFocuses(@Req() request: AuthRequest) {
    return this.customerService.listServiceFocuses(request.user)
  }

  @Post('service-focuses')
  createServiceFocus(@Req() request: AuthRequest, @Body() body: SaveServiceFocusDto) {
    return this.customerService.createServiceFocus(request.user, body)
  }

  @Patch('service-focuses/:id')
  updateServiceFocus(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() body: SaveServiceFocusDto
  ) {
    return this.customerService.updateServiceFocus(request.user, Number(id), body)
  }
}
