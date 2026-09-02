import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
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
  imports: [ScheduleCalendarComponent],
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

  monthSchedule!: ScheduleAppointementMonthModel;
  clients: SelectClientModel[] = [];

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.SCHEDULE) private readonly httpService: IScheduleService,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly clientHttpService: IClientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackbarManage: ISnackbarManagerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = today;

    // Busca clientes e agendamentos juntos no inicio
    this.subscriptions.push(
      forkJoin({
        clients: this.clientHttpService.list(),
        schedules: this.httpService.listInMonth(today.getFullYear(), today.getMonth() + 1),
      }).subscribe({
        next: ({ clients, schedules }: any) => {
          this.clients = Array.isArray(clients) ? clients : clients.clients || clients.content || [];

          const appointmentsList = Array.isArray(schedules)
            ? schedules
            : schedules.scheduledAppointments || [];

          this.monthSchedule = {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            scheduledAppointments: appointmentsList,
          };

          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: () => this.snackbarManage.show('Erro ao carregar dados iniciais'),
      })
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

    this.httpService.listInMonth(year, month).subscribe({
      next: (data: any) => {
        const appointmentsList = Array.isArray(data)
          ? data
          : data.scheduledAppointments || [];

        this.monthSchedule = {
          year,
          month,
          scheduledAppointments: appointmentsList,
        };

        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: () => {
        this.monthSchedule = {
          year,
          month,
          scheduledAppointments: [],
        };
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
    });
  }
}
