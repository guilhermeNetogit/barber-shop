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
    console.log('3. Evento recebido no Pai com os dados:', value);
    const { id, ...request } = value;

    this.httpSubscription = this.httpService.listByEmail(request.email).pipe(switchMap((clients: any[]) => {
      if(clients && clients.length > 0) {
        this.snackBarManager.show('Este e-mail já está cadastrado!');
        return of(null);
      }
      return this.httpService.save(request);
    })
  ).subscribe({
      next: (res) => {
        if(res) {
        console.log('4. Resposta do Backend:', res);
        this.snackBarManager.show('Usuário cadastrado com sucesso!');
        this.router.navigate(['client/list']);
        }
      },
      error: (err) => console.error('5. Erro na requisição HTTP:', err),
    });
  }
}
