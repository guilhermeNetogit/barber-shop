import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { ClientsService } from '../../services/api-client/clients/clients.service';
import { IClientService } from '../../services/api-client/clients/iclient.service';
import { IScheduleService } from '../../services/api-client/schedules/ischedule.service';
import { SaveScheduleRequest } from '../../services/api-client/schedules/schedule.models';
import { SchedulesService } from '../../services/api-client/schedules/schedule.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';
import { SnackbarManagerService } from '../../services/snackbar-manager.service';
import { ScheduleCalendarComponent } from '../components/schedule-calendar/schedule-calendar.component';
import {
  ClientScheduleAppointmentModel,
  SaveScheduleModel,
  ScheduleAppointementMonthModel,
  SelectClientModel,
} from '../schedule.models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-schedules-month',
  standalone: true,
  imports: [
    ScheduleCalendarComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
  ],
  templateUrl: './schedules-month.component.html',
  styleUrl: './schedules-month.component.scss',
  providers: [
    { provide: SERVICES_TOKEN.HTTP.SCHEDULE, useClass: SchedulesService },
    { provide: SERVICES_TOKEN.HTTP.CLIENT, useClass: ClientsService },
    { provide: SERVICES_TOKEN.SNACKBAR, useClass: SnackbarManagerService },
  ],
})
export class SchedulesMonthComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private selectedDate?: Date;

  // Stream reativa para controle de estado no template
  data$!: Observable<{ clients: SelectClientModel[]; schedules: ScheduleAppointementMonthModel }>;
  loadingError = signal<boolean>(false);

  monthSchedule!: ScheduleAppointementMonthModel;
  clients: SelectClientModel[] = [];

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.SCHEDULE) private readonly httpService: IScheduleService,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly clientHttpService: IClientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackbarManage: ISnackbarManagerService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date();
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadingError.set(false);
    const today = this.selectedDate ?? new Date();

    this.data$ = forkJoin({
      clients: this.clientHttpService.list(),
      schedules: this.httpService.listInMonth(today.getFullYear(), today.getMonth() + 1),
    }).pipe(
      timeout(4000),
      map(({ clients, schedules }: any) => {
        const clientList = Array.isArray(clients)
          ? clients
          : clients.clients || clients.content || [];
        const appointmentsList = Array.isArray(schedules)
          ? schedules
          : schedules.scheduledAppointments || [];

        const monthScheduleData: ScheduleAppointementMonthModel = {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          scheduledAppointments: appointmentsList,
        };

        return { clients: clientList, schedules: monthScheduleData };
      }),
      tap(({ clients, schedules }) => {
        this.clients = clients;
        this.monthSchedule = schedules;
        setTimeout(() => this.cdr.detectChanges(), 0);
      }),
      catchError(() => {
        this.loadingError.set(true);
        return of({
          clients: [],
          schedules: {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            scheduledAppointments: [],
          },
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.fetchSchedules(date);
  }

  onConfirmDelete(schedule: ClientScheduleAppointmentModel) {
    this.httpService.delete(schedule.id).subscribe({
      next: () => {
        this.snackbarManage.show('Agendamento excluído com sucesso');
        this.fetchSchedules(this.selectedDate ?? new Date());
      },
      error: () => this.snackbarManage.show('Erro ao excluir o agendamento'),
    });
  }

  onScheduleClient(schedule: SaveScheduleModel) {
    if (schedule.startAt && schedule.endAt && schedule.clientId) {
      const request: SaveScheduleRequest = {
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        clientId: schedule.clientId,
      };

      this.httpService.save(request).subscribe({
        next: () => {
          this.snackbarManage.show('Agendamento realizado com sucesso');
          this.fetchSchedules(this.selectedDate ?? new Date());
        },
        error: () => this.snackbarManage.show('Erro ao realizar o agendamento'),
      });
    }
  }

  fetchSchedules(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    this.httpService
      .listInMonth(year, month)
      .pipe(
        timeout(4000),
        map((data: any) => {
          const appointmentsList = Array.isArray(data) ? data : data.scheduledAppointments || [];

          return {
            year,
            month,
            scheduledAppointments: appointmentsList,
          };
        }),
        tap((schedules) => {
          this.monthSchedule = schedules;
          setTimeout(() => this.cdr.detectChanges(), 0);
        }),
        catchError(() => {
          this.monthSchedule = { year, month, scheduledAppointments: [] };
          setTimeout(() => this.cdr.detectChanges(), 0);
          return of({ year, month, scheduledAppointments: [] });
        }),
      )
      .subscribe();
  }
}
