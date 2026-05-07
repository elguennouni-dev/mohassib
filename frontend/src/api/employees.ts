import { apiClient } from './client'
import type { Page } from './clients'

export type EmploymentType = 'PERMANENT' | 'CONTRACT' | 'PART_TIME' | 'SEASONAL'
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED'

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  PERMANENT: 'CDI',
  CONTRACT: 'CDD',
  PART_TIME: 'Temps partiel',
  SEASONAL: 'Saisonnier',
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Actif',
  ON_LEAVE: 'En congé',
  SUSPENDED: 'Suspendu',
  TERMINATED: 'Sortie',
}

export type Employee = {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  cinNumber: string | null
  cnssNumber: string | null
  hireDate: string
  endDate: string | null
  position: string | null
  department: string | null
  employmentType: EmploymentType
  baseSalary: string
  bonuses: string | null
  allowances: string | null
  bankAccountNumber: string | null
  bankName: string | null
  status: EmployeeStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type EmployeeFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  cinNumber: string
  cnssNumber: string
  hireDate: string
  endDate: string
  position: string
  department: string
  employmentType: EmploymentType
  baseSalary: string
  bonuses: string
  allowances: string
  bankAccountNumber: string
  bankName: string
  status: EmployeeStatus
  notes: string
}

const TODAY_ISO = () => new Date().toISOString().slice(0, 10)

export const buildEmptyEmployeeForm = (): EmployeeFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cinNumber: '',
  cnssNumber: '',
  hireDate: TODAY_ISO(),
  endDate: '',
  position: '',
  department: '',
  employmentType: 'PERMANENT',
  baseSalary: '',
  bonuses: '',
  allowances: '',
  bankAccountNumber: '',
  bankName: '',
  status: 'ACTIVE',
  notes: '',
})

export function employeeToForm(e: Employee): EmployeeFormValues {
  return {
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email ?? '',
    phone: e.phone ?? '',
    cinNumber: e.cinNumber ?? '',
    cnssNumber: e.cnssNumber ?? '',
    hireDate: e.hireDate,
    endDate: e.endDate ?? '',
    position: e.position ?? '',
    department: e.department ?? '',
    employmentType: e.employmentType,
    baseSalary: e.baseSalary,
    bonuses: e.bonuses ?? '',
    allowances: e.allowances ?? '',
    bankAccountNumber: e.bankAccountNumber ?? '',
    bankName: e.bankName ?? '',
    status: e.status,
    notes: e.notes ?? '',
  }
}

function toPayload(values: EmployeeFormValues) {
  const numOrNull = (s: string) => (s.trim() === '' ? null : Number(s))
  const strOrNull = (s: string) => (s.trim() === '' ? null : s.trim())
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: strOrNull(values.email),
    phone: strOrNull(values.phone),
    cinNumber: strOrNull(values.cinNumber),
    cnssNumber: strOrNull(values.cnssNumber),
    hireDate: values.hireDate,
    endDate: values.endDate.trim() === '' ? null : values.endDate,
    position: strOrNull(values.position),
    department: strOrNull(values.department),
    employmentType: values.employmentType,
    baseSalary: values.baseSalary === '' ? null : Number(values.baseSalary),
    bonuses: numOrNull(values.bonuses),
    allowances: numOrNull(values.allowances),
    bankAccountNumber: strOrNull(values.bankAccountNumber),
    bankName: strOrNull(values.bankName),
    status: values.status,
    notes: strOrNull(values.notes),
  }
}

type ListOptions = {
  search?: string
  status?: EmployeeStatus
  page?: number
  size?: number
}

export async function listEmployees(opts: ListOptions = {}): Promise<Page<Employee>> {
  const params: Record<string, string> = {}
  if (opts.search && opts.search.trim()) params.search = opts.search.trim()
  if (opts.status) params.status = opts.status
  if (opts.page !== undefined) params.page = String(opts.page)
  if (opts.size !== undefined) params.size = String(opts.size)
  const res = await apiClient.get<Page<Employee>>('/employees', { params })
  return res.data
}

export async function getEmployee(id: number): Promise<Employee> {
  const res = await apiClient.get<Employee>(`/employees/${id}`)
  return res.data
}

export async function createEmployee(values: EmployeeFormValues): Promise<Employee> {
  const res = await apiClient.post<Employee>('/employees', toPayload(values))
  return res.data
}

export async function updateEmployee(id: number, values: EmployeeFormValues): Promise<Employee> {
  const res = await apiClient.put<Employee>(`/employees/${id}`, toPayload(values))
  return res.data
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/employees/${id}`)
}
