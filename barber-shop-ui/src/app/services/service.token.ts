import { InjectionToken } from '@angular/core';
import { IScheduleService } from './api-client/schedules/ischedule.service';
import { IDialogManagerService } from './idialog-manager.service';
import { ISnackbarManagerService } from './isnackbar-manager.service';
import { IClientService } from './api-client/clients/iclient.service';

export const SERVICES_TOKEN = {
  HTTP: {
    CLIENT: new InjectionToken<IClientService>('SERVICES_TOKEN.HTTP.CLIENT'),
    SCHEDULE: new InjectionToken<IScheduleService>('SERVICES_TOKEN.HTTP.SCHEDULE'),
  },
  SNACKBAR: new InjectionToken<ISnackbarManagerService>('SERVICES_TOKEN.SNACKBAR'),
  DIALOG: new InjectionToken<IDialogManagerService>('SERVICES_TOKEN.DIALOG'),
};
