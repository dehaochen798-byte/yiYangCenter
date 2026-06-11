import { request } from '@/api/request'

export interface CustomerOverview {
  residentCount: number
  activeResidentCount: number
  occupiedBedCount: number
  vacantBedCount: number
}

export function getCustomerOverview() {
  return request<CustomerOverview>({
    url: '/api/customer/overview',
  })
}
