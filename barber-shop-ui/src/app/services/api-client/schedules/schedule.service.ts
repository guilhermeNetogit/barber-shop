import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SaveScheduleRequest, SaveScheduleResponse, ScheduleAppointmentMonthResponse } from './schedule.models';
import { environment } from '../../../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { IScheduleService } from './ischedule.service';
import { ScheduleAppointementMonthModel } from '../../../schedules/schedule.models';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService implements IScheduleService {

  private readonly basePath = environment.apiUrl

  constructor(private http: HttpClient) { }

  save(request: SaveScheduleRequest): Observable<SaveScheduleResponse> {
    return this.http.post<SaveScheduleResponse>(`${this.basePath}schedules`, request)
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.basePath}schedules/${id}`)
  }
  listInMonth(year: number, month: number): Observable<ScheduleAppointmentMonthResponse> {
  return this.http.get<ScheduleAppointmentMonthResponse>(`${this.basePath}schedules?year=${year}&month=${month}`);
}

  getByMonth(year: number, month: number): Observable<ScheduleAppointementMonthModel> {
    const formattedMonth = String(month).padStart(2, '0');
    return this.http.get<ScheduleAppointementMonthModel>(`${this.basePath}schedules?year=${year}&month=${month}`);
  }

}
