import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { CustomerService } from './customer.service.js'

@Controller('customer')
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
  createResident(@Body() body: Record<string, unknown>) {
    return this.customerService.createResident(body as never)
  }

  @Patch('residents/:id')
  updateResident(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateResident(Number(id), body as never)
  }

  @Get('users')
  listUsers() {
    return this.customerService.listUsers()
  }

  @Post('users')
  createUser(@Body() body: Record<string, unknown>) {
    return this.customerService.createUser(body as never)
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateUser(Number(id), body as never)
  }

  @Get('rooms')
  listRooms() {
    return this.customerService.listRooms()
  }

  @Post('rooms')
  createRoom(@Body() body: Record<string, unknown>) {
    return this.customerService.createRoom(body as never)
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateRoom(Number(id), body as never)
  }

  @Get('beds')
  listBeds() {
    return this.customerService.listBeds()
  }

  @Post('beds')
  createBed(@Body() body: Record<string, unknown>) {
    return this.customerService.createBed(body as never)
  }

  @Patch('beds/:id')
  updateBed(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateBed(Number(id), body as never)
  }

  @Get('meal-plans')
  listMealPlans() {
    return this.customerService.listMealPlans()
  }

  @Post('meal-plans')
  createMealPlan(@Body() body: Record<string, unknown>) {
    return this.customerService.createMealPlan(body as never)
  }

  @Patch('meal-plans/:id')
  updateMealPlan(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateMealPlan(Number(id), body as never)
  }

  @Get('meal-calendars')
  listMealCalendars() {
    return this.customerService.listMealCalendars()
  }

  @Post('meal-calendars')
  createMealCalendar(@Body() body: Record<string, unknown>) {
    return this.customerService.createMealCalendar(body as never)
  }

  @Patch('meal-calendars/:id')
  updateMealCalendar(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateMealCalendar(Number(id), body as never)
  }

  @Get('check-ins')
  listCheckIns() {
    return this.customerService.listCheckIns()
  }

  @Post('check-ins')
  createCheckIn(@Body() body: Record<string, unknown>) {
    return this.customerService.createCheckIn(body as never)
  }

  @Get('check-outs')
  listCheckOuts() {
    return this.customerService.listCheckOuts()
  }

  @Post('check-outs')
  createCheckOut(@Body() body: Record<string, unknown>) {
    return this.customerService.createCheckOut(body as never)
  }

  @Get('outings')
  listOutings() {
    return this.customerService.listOutings()
  }

  @Post('outings')
  createOuting(@Body() body: Record<string, unknown>) {
    return this.customerService.createOuting(body as never)
  }

  @Patch('outings/:id/return')
  returnOuting(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.returnOuting(Number(id), body as never)
  }

  @Get('service-targets')
  listServiceTargets() {
    return this.customerService.listServiceTargets()
  }

  @Post('service-targets')
  createServiceTarget(@Body() body: Record<string, unknown>) {
    return this.customerService.createServiceTarget(body as never)
  }

  @Patch('service-targets/:id')
  updateServiceTarget(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateServiceTarget(Number(id), body as never)
  }

  @Get('service-focuses')
  listServiceFocuses() {
    return this.customerService.listServiceFocuses()
  }

  @Post('service-focuses')
  createServiceFocus(@Body() body: Record<string, unknown>) {
    return this.customerService.createServiceFocus(body as never)
  }

  @Patch('service-focuses/:id')
  updateServiceFocus(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.customerService.updateServiceFocus(Number(id), body as never)
  }
}
