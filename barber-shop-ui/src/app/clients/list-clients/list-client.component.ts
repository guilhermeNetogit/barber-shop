import { AsyncPipe } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { ClientsService } from '../../services/api-client/clients/clients.service';
import { IClientService } from '../../services/api-client/clients/iclient.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';
import { SnackbarManagerService } from '../../services/snackbar-manager.service';
import { ClientModelTable } from '../client.models';
import { ClientTableComponent } from '../components/client-table/client-table.component';

@Component({
  selector: 'app-list-clients',
  imports: [
    ClientTableComponent,
    AsyncPipe,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatAnchor,
    MatInputModule,
  ],
  templateUrl: './list-client.component.html',
  styleUrl: './list-client.component.scss',
  providers: [
    { provide: SERVICES_TOKEN.HTTP.CLIENT, useClass: ClientsService },
    { provide: SERVICES_TOKEN.SNACKBAR, useClass: SnackbarManagerService },
  ],
})
export class ListClientsComponent implements OnInit {
  // Transforma em Observable
  clients$!: Observable<ClientModelTable[]>;
  loadingError = signal<boolean>(false);
  dataSource = new MatTableDataSource<ClientModelTable>([]);

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly httpService: IClientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackBarManager: ISnackbarManagerService,
    private readonly router: Router,
  ) {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loadingError.set(false);
    // A ordenação e o tratamento do array acontecem dentro da stream reativa
    this.clients$ = this.httpService.list().pipe(
      timeout(4000),
      map((data: any) => {
        const list: ClientModelTable[] = Array.isArray(data)
          ? data
          : data.clients || data.content || [];
        return list.sort((a, b) => a.name.localeCompare(b.name));
      }),
      tap((list) => {
        this.dataSource.data = list;
      }),
      catchError(() => {
        this.loadingError.set(true);
        this.dataSource.data = [];
        return of([]);
      }),
    );
  }

  update(client: ClientModelTable) {
    this.router.navigate(['clients/edit-client', client.id]);
  }

  delete(client: ClientModelTable) {
    if (!client.id) return;

    this.httpService.delete(client.id).subscribe(() => {
      this.snackBarManager.show(`O cliente ${client.name} foi excluído com sucesso`);
      // Recarrega a lista reativamente após a exclusão
      this.loadClients();
    });
  }
}
