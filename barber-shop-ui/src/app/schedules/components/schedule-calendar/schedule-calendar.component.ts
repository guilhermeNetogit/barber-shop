import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { YesNoDialogComponent } from '../../../commons/components/yes-no-dialog/yes-no-dialog.component';
import { DialogManagerService } from '../../../services/dialog-manager.service';
import { IDialogManagerService } from '../../../services/idialog-manager.service';
import { SERVICES_TOKEN } from '../../../services/service.token';
import {
  ClientScheduleAppointmentModel,
  SaveScheduleModel,
  ScheduleAppointementMonthModel,
  SelectClientModel,
} from '../../schedule.models';

@Component({
  selector: 'app-schedule-calendar',
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatTimepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './schedule-calendar.component.html',
  styleUrl: './schedule-calendar.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: SERVICES_TOKEN.DIALOG,
      useClass: DialogManagerService,
    },
  ],
})
export class ScheduleCalendarComponent implements OnDestroy, AfterViewInit, OnChanges {
  private subscription?: Subscription;

  private _selected: Date = new Date();

  displayedColumns: string[] = ['startAt', 'endAt', 'client', 'actions'];

  dataSource: MatTableDataSource<ClientScheduleAppointmentModel> = new MatTableDataSource();

  addingSchedule: boolean = false;

  newSchedule: SaveScheduleModel = { startAt: undefined, endAt: undefined, clientId: undefined };

  clientSelectFormControl = new FormControl();

  @Input() monthSchedule!: ScheduleAppointementMonthModel;
  @Input() clients: SelectClientModel[] = [];

  @Output() onDateChange = new EventEmitter<Date>();
  @Output() onConfirmDelete = new EventEmitter<ClientScheduleAppointmentModel>();
  @Output() onScheduleClient = new EventEmitter<SaveScheduleModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    @Inject(SERVICES_TOKEN.DIALOG) private readonly dialogManagerService: IDialogManagerService,
  ) {}

  get selected(): Date {
    return this._selected;
  }

  set selected(selected: Date) {
    if (selected && (!this._selected || this._selected.getTime() !== selected.getTime())) {
      this._selected = selected; // Atualiza ANTES para o buildTable pegar a data nova
      this.onDateChange.emit(selected);
      this.buildTable();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['monthSchedule'] || changes['clients']) && this.monthSchedule) {
      this.buildTable();
    }
  }

  onSubmit(form: NgForm) {
    if (!this.newSchedule.startAt || !this.newSchedule.endAt || !this.newSchedule.clientId) {
      return;
    }

    let startHours = 0;
    let startMinutes = 0;

    const startVal = this.newSchedule.startAt as any;

    if (typeof startVal === 'string') {
      const [h, m] = startVal.split(':').map(Number);
      startHours = h;
      startMinutes = m;
    } else if (startVal instanceof Date) {
      startHours = startVal.getHours();
      startMinutes = startVal.getMinutes();
    }

    const startAt = new Date(this._selected);
    startAt.setHours(startHours, startMinutes, 0);

    const endAt = new Date(this.newSchedule.endAt);

    const clientObj = this.clients.find((c) => Number(c.id) === Number(this.newSchedule.clientId));

    const saved: ClientScheduleAppointmentModel = {
      id: -1,
      day: this._selected.getDate(),
      startAt,
      endAt,
      clientId: Number(this.newSchedule.clientId),
      clientName: clientObj ? clientObj.name : 'Cliente',
    };

    // Emite para salvar no backend
    this.onScheduleClient.emit({
      startAt: saved.startAt,
      endAt: saved.endAt,
      clientId: saved.clientId,
    });

    this.newSchedule = { startAt: undefined, endAt: undefined, clientId: undefined };
    form.resetForm();
  }

  requestDelete(schedule: ClientScheduleAppointmentModel) {
    this.subscription = this.dialogManagerService
      .showYesNoDialog(YesNoDialogComponent, {
        title: 'Exclusão de agendamento',
        content: 'Confirma a exclusão do agendamento?',
      })
      .subscribe((result) => {
        if (result) {
          this.onConfirmDelete.emit(schedule);
          const updatedeList = this.dataSource.data.filter((c) => c.id !== schedule.id);
          this.dataSource = new MatTableDataSource<ClientScheduleAppointmentModel>(updatedeList);
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        }
      });
  }

  onTimeChange(time: string | Date | null) {
    if (!time) return;

    let hours = 0;
    let minutes = 0;

    if (typeof time === 'string') {
      const [h, m] = time.split(':').map(Number);
      hours = h;
      minutes = m;
    } else if (time instanceof Date) {
      hours = time.getHours();
      minutes = time.getMinutes();
    }

    // Calcula 1 hora a mais para o término
    const endAt = new Date(this._selected);
    endAt.setHours(hours + 1, minutes, 0);

    this.newSchedule.endAt = endAt;
  }

  private buildTable() {
    if (!this.monthSchedule || !this.monthSchedule.scheduledAppointments) {
      this.dataSource = new MatTableDataSource<ClientScheduleAppointmentModel>([]);
      return;
    }

    const selYear = this._selected.getFullYear();
    const selMonth = this._selected.getMonth();
    const selDay = this._selected.getDate();

    const appointments = this.monthSchedule.scheduledAppointments
      .map((a: any) => {
        const start = new Date(a.startAt);
        const end = new Date(a.endAt);
        const client = this.clients.find((c) => Number(c.id) === Number(a.clientId));

        return {
          ...a,
          startAt: start,
          endAt: end,
          day: start.getDate(),
          clientName: a.clientName || client?.name || 'Cliente',
        };
      })
      .filter((a) => {
        return (
          a.startAt.getFullYear() === selYear &&
          a.startAt.getMonth() === selMonth &&
          a.startAt.getDate() === selDay
        );
      });

    this.dataSource = new MatTableDataSource<ClientScheduleAppointmentModel>(appointments);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // Lista de horários disponíveis no dia (de 30 em 30 min)
  availableTimeSlots: string[] = [
    '07:00', '07:30','08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

isTimeSlotDisabled(timeString: string): boolean {
  if (!this.dataSource || !this.dataSource.data || this.dataSource.data.length === 0) {
    return false;
  }

  const [hours, minutes] = timeString.split(':').map(Number);
  const slotMinutes = hours * 60 + minutes;

  return this.dataSource.data.some((schedule) => {
    const start = new Date(schedule.startAt);
    const end = new Date(schedule.endAt);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    let endMinutes = end.getHours() * 60 + end.getMinutes();

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
}
}
