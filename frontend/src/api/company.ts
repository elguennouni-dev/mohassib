import { apiClient } from './client'
import type { Company, FiscalYearStart } from '../auth/AuthContext'

export type CompanyFormValues = {
  name: string
  tradeName: string
  iceNumber: string
  rcNumber: string
  cnssNumber: string
  sector: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
  website: string
  employeesCount: string
  fiscalYearStart: FiscalYearStart
}

export const emptyCompanyForm: CompanyFormValues = {
  name: '',
  tradeName: '',
  iceNumber: '',
  rcNumber: '',
  cnssNumber: '',
  sector: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  website: '',
  employeesCount: '',
  fiscalYearStart: 'JANUARY',
}

export function companyToForm(company: Company): CompanyFormValues {
  return {
    name: company.name,
    tradeName: company.tradeName ?? '',
    iceNumber: company.iceNumber,
    rcNumber: company.rcNumber,
    cnssNumber: company.cnssNumber,
    sector: company.sector ?? '',
    address: company.address,
    city: company.city,
    postalCode: company.postalCode ?? '',
    phone: company.phone,
    email: company.email,
    website: company.website ?? '',
    employeesCount: company.employeesCount?.toString() ?? '',
    fiscalYearStart: company.fiscalYearStart,
  }
}

function toPayload(values: CompanyFormValues) {
  const employeesCountStr = values.employeesCount.trim()
  return {
    name: values.name.trim(),
    tradeName: values.tradeName.trim() || null,
    iceNumber: values.iceNumber.trim(),
    rcNumber: values.rcNumber.trim(),
    cnssNumber: values.cnssNumber.trim(),
    sector: values.sector.trim() || null,
    address: values.address.trim(),
    city: values.city.trim(),
    postalCode: values.postalCode.trim() || null,
    phone: values.phone.trim(),
    email: values.email.trim(),
    website: values.website.trim() || null,
    employeesCount: employeesCountStr === '' ? null : Number(employeesCountStr),
    fiscalYearStart: values.fiscalYearStart,
  }
}

export async function createCompany(values: CompanyFormValues): Promise<Company> {
  const res = await apiClient.post<Company>('/companies', toPayload(values))
  return res.data
}

export async function updateCompany(values: CompanyFormValues): Promise<Company> {
  const res = await apiClient.put<Company>('/companies/me', toPayload(values))
  return res.data
}
