import { Component, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { ClientsService } from '../../services/api-client/clients/clients.service';
import { IClientService } from '../../services/api-client/clients/iclient.service';
import { SERVICES_TOKEN } from '../../services/service.token';
import { ClientModelForm } from '../client.models';
import { ClientFormComponent } from '../components/client-form/client-form.component';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SnackbarManagerService } from '../../services/snackbar-manager.service';

@Component({
  selector: 'app-new-client',
  imports: [ClientFormComponent],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.scss',
  providers: [
    { provide: SERVICES_TOKEN.HTTP.CLIENT, useClass: ClientsService },
    { provide: SERVICES_TOKEN.SNACKBAR, useClass: SnackbarManagerService },
  ],
})
export class NewClientComponent implements OnDestroy {
  private httpSubscription?: Subscription;

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly httpService: IClientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackBarManager: ISnackbarManagerService,

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
      error: (err) => {
        console.error('Erro na requisição HTTP:', err);
        const backendMessage =
          err?.error?.MESSAGE || err?.error?.detail || 'Erro ao cadastrar o cliente.';
        this.snackBarManager.show(backendMessage);
      },
    });
  }
}
