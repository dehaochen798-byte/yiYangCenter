import { request } from '@/api/request'
import type { ResidentItem } from '@/modules/customer/user/api/resident.api'

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
