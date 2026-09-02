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

    const startAt = new Date(this._selected);
    const endAt = new Date(this._selected);
    startAt.setHours(this.newSchedule.startAt.getHours(), this.newSchedule.startAt.getMinutes(), 0);
    endAt.setHours(this.newSchedule.endAt.getHours(), this.newSchedule.endAt.getMinutes(), 0);

    const clientObj = this.clients.find((c) => Number(c.id) === Number(this.newSchedule.clientId));

    const saved: ClientScheduleAppointmentModel = {
      id: -1,
      day: this._selected.getDate(),
      startAt,
      endAt,
      clientId: Number(this.newSchedule.clientId),
      clientName: clientObj ? clientObj.name : 'Cliente',
    };

    // Emite para o pai salvar no backend/JSON Server
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

  onTimeChange(time: Date | null) {
    if (!time) return;

    const endAt = new Date(time);
    endAt.setHours(time.getHours() + 1);
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
}
