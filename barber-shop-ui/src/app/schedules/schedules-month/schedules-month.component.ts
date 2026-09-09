import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subscription, forkJoin, map, of } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
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
        const rawClients = Array.isArray(clients)
          ? clients
          : clients.clients || clients.content || [];

        const clientList: SelectClientModel[] = rawClients
          .map((client: any) => ({
            id: client.CODCLI ?? client.id,
            name: client.NOME ?? client.name ?? '',
          }))
          .sort((a: SelectClientModel, b: SelectClientModel) =>
            a.name.localeCompare(b.name, 'pt-Br', { sensitivity: 'base' }),
          );

        const rawAppointments = Array.isArray(schedules)
          ? schedules
          : schedules.scheduledAppointments || [];

        const appointmentsList = rawAppointments.map((item: any) => ({
          id: item.CODAGE ?? item.id,
          day: item.DIA ?? item.day,
          startAt: item.INICIO ?? item.startAt,
          endAt: item.FIM ?? item.endAt,
          clientId: item.CODCLI ?? item.clientId,
          clientName: item.NOME ?? item.clientName,
        }));

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
      const selected = this.selectedDate ?? new Date();

      const formatLocalISO = (date: Date): string => {
        const pad = (num: number) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      // Extrai hora e minuto do startAt
      let startHours = 0,
        startMinutes = 0;
      const startVal = schedule.startAt as any;
      if (startVal instanceof Date) {
        startHours = startVal.getHours();
        startMinutes = startVal.getMinutes();
      } else if (typeof startVal === 'string') {
        const parts = startVal.includes('T')
          ? startVal.split('T')[1].split(':')
          : startVal.split(':');
        startHours = parseInt(parts[0], 10) || 0;
        startMinutes = parseInt(parts[1], 10) || 0;
      }

      // Extrai hora e minuto do endAt
      let endHours = 0,
        endMinutes = 0;
      const endVal = schedule.endAt as any;
      if (endVal instanceof Date) {
        endHours = endVal.getHours();
        endMinutes = endVal.getMinutes();
      } else if (typeof endVal === 'string') {
        const parts = endVal.includes('T') ? endVal.split('T')[1].split(':') : endVal.split(':');
        endHours = parseInt(parts[0], 10) || 0;
        endMinutes = parseInt(parts[1], 10) || 0;
      }

      // Data de Início no dia selecionado
      const startDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        startHours,
        startMinutes,
        0,
      );

      // Data de Término
      const endDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        endHours,
        endMinutes,
        0,
      );
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1); // Trata virada do dia (ex: 23:30 até 00:30)
      }

      const request = {
        INICIO: formatLocalISO(startDate),
        FIM: formatLocalISO(endDate),
        CODCLI: Number(schedule.clientId),
      };

      this.httpService.save(request as any).subscribe({
        next: () => {
          this.snackbarManage.show('Agendamento realizado com sucesso');
          this.fetchSchedules(this.selectedDate ?? new Date());
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          this.snackbarManage.show('Erro ao realizar o agendamento');
        },
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
          const rawAppointments = Array.isArray(data) ? data : data.scheduledAppointments || [];

          const appointmentsList = rawAppointments.map((item: any) => ({
            id: item.CODAGE ?? item.id,
            day: item.DIA ?? item.day,
            startAt: item.INICIO ?? item.startAt,
            endAt: item.FIM ?? item.endAt,
            clientId: item.CODCLI ?? item.clientId,
            clientName: item.NOME ?? item.clientName,
          }));

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
