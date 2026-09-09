import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientsService } from '../../services/api-client/clients/clients.service';
import { IClientService } from '../../services/api-client/clients/iclient.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';
import { SnackbarManagerService } from '../../services/snackbar-manager.service';
import { ClientModelForm } from '../client.models';
import { ClientFormComponent } from '../components/client-form/client-form.component';

@Component({
  selector: 'app-edit-client',
  imports: [ClientFormComponent],
  templateUrl: './edit-client.component.html',
  styleUrl: './edit-client.component.scss',
  providers: [
    { provide: SERVICES_TOKEN.HTTP.CLIENT, useClass: ClientsService },
    { provide: SERVICES_TOKEN.SNACKBAR, useClass: SnackbarManagerService }
  ]
})
export class EditClientComponent implements OnInit, OnDestroy {

  private httpsubscription?: Subscription;

  client: ClientModelForm = { id: 0, name: '', email: '', phone: '' }

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly httpService: IClientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackBarManager: ISnackbarManagerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {
      this.snackBarManager.show('Erro ao recuperar informações do cliente');
      this.router.navigate(['clients/list']);
      return;
    }

    this.httpsubscription = this.httpService.findById(Number(id)).subscribe({
      next: (data: any) => {
        // 1. Mapeia as propriedades em CAIXA ALTA do backend para as propriedades em caixa baixa
        this.client = {
          id: data.CODCLI ?? data.id,
          name: data.NOME ?? data.name,
          email: data.EMAIL ?? data.email,
          phone: data.TELEFONE ?? data.phone
        };

        // 2. Notifica o Angular para atualizar a tela e liberar o @if
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBarManager.show('Erro ao carregar dados do cliente');
      }
    });
  }

  ngOnDestroy(): void {
    this.httpsubscription?.unsubscribe();
  }

  onSubmitClient(formData: any): void {
  const id = this.activatedRoute.snapshot.paramMap.get('id');

  if (!id) return;

  // Remova caracteres não numéricos do telefone caso a API aceite só números
  const rawPhone = formData.phone ? formData.phone.replace(/\D/g, '') : '';

  // Monte o objeto no formato esperado pelo Backend (Caixa Alta)
  const payload = {
    CODCLI: Number(id),
    NOME: formData.name,
    EMAIL: formData.email,
    TELEFONE: rawPhone // ou formData.phone, dependendo de como o banco salva
  };

  this.httpService.update(Number(id), payload as any).subscribe({
    next: () => {
      this.snackBarManager.show('Cliente atualizado com sucesso!');
      this.router.navigate(['clients/list']);
    },
    error: (err) => {
      console.error('Erro na atualização:', err);
      this.snackBarManager.show('Erro ao atualizar dados do cliente.');
    }
  });
}

}
