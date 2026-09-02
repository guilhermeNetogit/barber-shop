export interface ScheduleAppointmentMonthResponse {
    year: number,
    month: number
    scheduledAppointments: ClientScheduleAppointementResponse[]
}

export interface ClientScheduleAppointementResponse {
    id: number
    day: number
    startAt: Date
    endAt: Date
    clientId: number
    clientName: string
}

export interface SaveScheduleResponse {
    id: number
    startAt: Date
    endAt: Date
    clientId: number
}

export interface SaveScheduleRequest {
    startAt: Date
    endAt: Date
    clientId: number
}
