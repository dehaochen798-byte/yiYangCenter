import { request } from '@/api/request'

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
