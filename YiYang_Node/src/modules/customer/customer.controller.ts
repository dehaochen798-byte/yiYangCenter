import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
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
} from './dto/customer.dto.js'
import { CustomerService } from './customer.service.js'

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('modules')
  getModules() {
    return this.customerService.getModules()
  }

  @Get('overview')
  getOverview() {
    return this.customerService.getOverview()
  }

  @Get('residents')
  listResidents() {
    return this.customerService.listResidents()
  }

  @Post('residents')
  createResident(@Body() body: SaveResidentDto) {
    return this.customerService.createResident(body)
  }

  @Patch('residents/:id')
  updateResident(@Param('id') id: string, @Body() body: SaveResidentDto) {
    return this.customerService.updateResident(Number(id), body)
  }

  @Get('users')
  listUsers() {
    return this.customerService.listUsers()
  }

  @Post('users')
  createUser(@Body() body: SaveUserDto) {
    return this.customerService.createUser(body)
  }

  @Patch('users/:id/reset-password')
  resetUserPassword(@Param('id') id: string) {
    return this.customerService.resetUserPassword(Number(id))
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: SaveUserDto) {
    return this.customerService.updateUser(Number(id), body)
  }

  @Get('rooms')
  listRooms() {
    return this.customerService.listRooms()
  }

  @Post('rooms')
  createRoom(@Body() body: SaveRoomDto) {
    return this.customerService.createRoom(body)
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() body: SaveRoomDto) {
    return this.customerService.updateRoom(Number(id), body)
  }

  @Get('beds')
  listBeds() {
    return this.customerService.listBeds()
  }

  @Post('beds')
  createBed(@Body() body: SaveBedDto) {
    return this.customerService.createBed(body)
  }

  @Patch('beds/:id')
  updateBed(@Param('id') id: string, @Body() body: SaveBedDto) {
    return this.customerService.updateBed(Number(id), body)
  }

  @Get('meal-plans')
  listMealPlans() {
    return this.customerService.listMealPlans()
  }

  @Post('meal-plans')
  createMealPlan(@Body() body: SaveMealPlanDto) {
    return this.customerService.createMealPlan(body)
  }

  @Patch('meal-plans/:id')
  updateMealPlan(@Param('id') id: string, @Body() body: SaveMealPlanDto) {
    return this.customerService.updateMealPlan(Number(id), body)
  }

  @Get('meal-calendars')
  listMealCalendars() {
    return this.customerService.listMealCalendars()
  }

  @Post('meal-calendars')
  createMealCalendar(@Body() body: SaveMealCalendarDto) {
    return this.customerService.createMealCalendar(body)
  }

  @Patch('meal-calendars/:id')
  updateMealCalendar(@Param('id') id: string, @Body() body: SaveMealCalendarDto) {
    return this.customerService.updateMealCalendar(Number(id), body)
  }

  @Get('check-ins')
  listCheckIns() {
    return this.customerService.listCheckIns()
  }

  @Post('check-ins')
  createCheckIn(@Body() body: CreateCheckInDto) {
    return this.customerService.createCheckIn(body)
  }

  @Get('check-outs')
  listCheckOuts() {
    return this.customerService.listCheckOuts()
  }

  @Post('check-outs')
  createCheckOut(@Body() body: CreateCheckOutDto) {
    return this.customerService.createCheckOut(body)
  }

  @Get('outings')
  listOutings() {
    return this.customerService.listOutings()
  }

  @Post('outings')
  createOuting(@Body() body: CreateOutingDto) {
    return this.customerService.createOuting(body)
  }

  @Patch('outings/:id/return')
  returnOuting(@Param('id') id: string, @Body() body: ReturnOutingDto) {
    return this.customerService.returnOuting(Number(id), body)
  }

  @Get('service-targets')
  listServiceTargets() {
    return this.customerService.listServiceTargets()
  }

  @Post('service-targets')
  createServiceTarget(@Body() body: SaveServiceTargetDto) {
    return this.customerService.createServiceTarget(body)
  }

  @Patch('service-targets/:id')
  updateServiceTarget(@Param('id') id: string, @Body() body: SaveServiceTargetDto) {
    return this.customerService.updateServiceTarget(Number(id), body)
  }

  @Get('service-focuses')
  listServiceFocuses() {
    return this.customerService.listServiceFocuses()
  }

  @Post('service-focuses')
  createServiceFocus(@Body() body: SaveServiceFocusDto) {
    return this.customerService.createServiceFocus(body)
  }

  @Patch('service-focuses/:id')
  updateServiceFocus(@Param('id') id: string, @Body() body: SaveServiceFocusDto) {
    return this.customerService.updateServiceFocus(Number(id), body)
  }
}
