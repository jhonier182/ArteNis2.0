import { apiClient } from '@/services/apiClient'

export interface Appointment {
  id: string
  userId: string
  tattooArtistId: string
  date: string
  time: string
  description?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export interface CreateAppointmentData {
  tattooArtistId: string
  date: string
  time: string
  description?: string
}

/**
 * Servicio para manejo de citas
 */
export const appointmentService = {
  async getAppointments(filters?: {
    userId?: string
    tattooArtistId?: string
    status?: Appointment['status']
  }): Promise<Appointment[]> {
    const response = await apiClient
      .getClient()
      .get<Appointment[]>('/appointments', { params: filters })
    return response.data
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await apiClient.getClient().get<Appointment>(`/appointments/${id}`)
    return response.data
  },

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.getClient().post<Appointment>('/appointments', data)
    return response.data
  },

  async updateAppointment(id: string, data: Partial<CreateAppointmentData>): Promise<Appointment> {
    const response = await apiClient.getClient().put<Appointment>(`/appointments/${id}`, data)
    return response.data
  },

  async cancelAppointment(id: string): Promise<void> {
    await apiClient.getClient().delete(`/appointments/${id}`)
  },
}

