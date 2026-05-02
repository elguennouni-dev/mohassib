import { apiClient } from './client'

export type Client = {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  iceNumber: string | null
  contactPerson: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type ClientFormValues = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  iceNumber: string
  contactPerson: string
  notes: string
}

export const emptyClientForm: ClientFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  iceNumber: '',
  contactPerson: '',
  notes: '',
}

export function clientToForm(c: Client): ClientFormValues {
  return {
    name: c.name,
    email: c.email ?? '',
    phone: c.phone ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    postalCode: c.postalCode ?? '',
    iceNumber: c.iceNumber ?? '',
    contactPerson: c.contactPerson ?? '',
    notes: c.notes ?? '',
  }
}

function toPayload(values: ClientFormValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    postalCode: values.postalCode.trim(),
    iceNumber: values.iceNumber.trim(),
    contactPerson: values.contactPerson.trim(),
    notes: values.notes.trim(),
  }
}

export type Page<T> = {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}

type ListOptions = {
  search?: string
  page?: number
  size?: number
}

export async function listClients(opts: ListOptions = {}): Promise<Page<Client>> {
  const params: Record<string, string> = {}
  if (opts.search && opts.search.trim()) params.search = opts.search.trim()
  if (opts.page !== undefined) params.page = String(opts.page)
  if (opts.size !== undefined) params.size = String(opts.size)
  const res = await apiClient.get<Page<Client>>('/clients', { params })
  return res.data
}

export async function getClient(id: number): Promise<Client> {
  const res = await apiClient.get<Client>(`/clients/${id}`)
  return res.data
}

export async function createClient(values: ClientFormValues): Promise<Client> {
  const res = await apiClient.post<Client>('/clients', toPayload(values))
  return res.data
}

export async function updateClient(id: number, values: ClientFormValues): Promise<Client> {
  const res = await apiClient.put<Client>(`/clients/${id}`, toPayload(values))
  return res.data
}

export async function deleteClient(id: number): Promise<void> {
  await apiClient.delete(`/clients/${id}`)
}
