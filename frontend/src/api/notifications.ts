import { apiClient } from './client'
import type { Page } from './clients'

export type NotificationType =
  | 'TVA_DECLARATION_REMINDER'
  | 'OVERDUE_INVOICES'
  | 'PAYROLL_REMINDER'
  | 'UNPAID_INVOICES'
  | 'INVOICE_DUE_SOON'
  | 'EMAIL_SEND_FAILURE'

export type Notification = {
  id: number
  type: NotificationType
  title: string
  message: string
  link: string | null
  read: boolean
  readAt: string | null
  createdAt: string
}

export type NotificationSummary = {
  unreadCount: number
  recent: Notification[]
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const res = await apiClient.get<NotificationSummary>('/notifications/summary')
  return res.data
}

export async function listNotifications(page: number, size: number): Promise<Page<Notification>> {
  const res = await apiClient.get<Page<Notification>>('/notifications', { params: { page, size } })
  return res.data
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const res = await apiClient.post<Notification>(`/notifications/${id}/read`)
  return res.data
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  const res = await apiClient.post<{ updated: number }>('/notifications/read-all')
  return res.data
}
