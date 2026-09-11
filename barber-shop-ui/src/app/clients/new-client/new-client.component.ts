import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { retry, Subscription } from 'rxjs';
import { YesNoDialogComponent } from '../../commons/components/yes-no-dialog/yes-no-dialog.component';
import { ClientsService } from '../../services/api-client/clients/clients.service';
import { IClientService } from '../../services/api-client/clients/iclient.service';
import { DialogManagerService } from '../../services/dialog-manager.service';
import { IDialogManagerService } from '../../services/idialog-manager.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';
import { SnackbarManagerService } from '../../services/snackbar-manager.service';
import { ClientModelForm } from '../client.models';
import { ClientFormComponent } from '../components/client-form/client-form.component';

@Component({
  selector: 'app-new-client',
  imports: [ClientFormComponent],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.scss',
  providers: [
    { provide: SERVICES_TOKEN.HTTP.CLIENT, useClass: ClientsService },
    { provide: SERVICES_TOKEN.SNACKBAR, useClass: SnackbarManagerService },
    { provide: SERVICES_TOKEN.DIALOG, useClass: DialogManagerService },
  ],
})
export class NewClientComponent implements OnDestroy {
  private httpSubscription?: Subscription;

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly httpService: IClientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackBarManager: ISnackbarManagerService,
    @Inject(SERVICES_TOKEN.DIALOG) private readonly dialogManager: IDialogManagerService,

    private readonly router: Router,
  ) {}

  ngOnDestroy(): void {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
  }

  onSubmitClient(value: ClientModelForm) {
    console.log('Dados do formulário original:', value);

    // Remove caracteres não numéricos do celular
    const rawPhone = value.phone ? value.phone.replace(/\D/g, '') : '';

    // Garante que o objeto tenha exatamente as chaves do record Java: name, email, phone
    const payload = {
      name: value.name,
      email: value.email.trim().toLowerCase(),
      phone: rawPhone,
    };

    console.log('Payload enviado no POST:', payload);

    this.httpSubscription = this.httpService.save(payload).subscribe({
      next: (res) => {
        console.log('Resposta do Backend:', res);
        this.snackBarManager.show('Usuário cadastrado com sucesso!');
        this.router.navigate(['clients/list']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.dialogManager.showYesNoDialog(YesNoDialogComponent, {
            title: 'Servidor Indisponível',
            content:
              'O sistema não conseguiu se comunicar com o servidor. Deseja tentar novamente?.'
          }).subscribe((retry) => {
            if(retry) {
              this.onSubmitClient(value);
            }
          });
        } else {
          this.snackBarManager.show(error.error?.message || 'Erro ao cadastrar cliente!');
        }
      },
    });
  }
}
