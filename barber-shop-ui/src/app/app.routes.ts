import { Routes } from '@angular/router';
import { EditClientComponent } from './clients/edit-client/edit-client.component';
import { NewClientComponent } from './clients/new-client/new-client.component';
import { ListClientsComponent } from './clients/list-clients/list-client.component';
import { SchedulesMonthComponent } from './schedules/schedules-month/schedules-month.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './header/main-layout/main-layout.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent, data: { title: 'Cadastro' } },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard.canActivate],
    children: [
      { path: '', redirectTo: 'schedules/month', pathMatch: 'full' },
      {
        path: 'clients/edit-client/:id',
        component: EditClientComponent,
        data: { title: 'Atualizar Cliente' },
      },
      {
        path: 'clients/new-client',
        component: NewClientComponent,
        data: { title: 'Cadastrar Cliente' },
      },
      {
        path: 'clients/list',
        component: ListClientsComponent,
        data: { title: 'Clientes Cadastrados' },
      },
      {
        path: 'schedules/month',
        component: SchedulesMonthComponent,
        data: { title: 'Agendamentos' },
      },
      {
        path: 'profile/edit',
        component: EditProfileComponent,
        data: { title: 'Meus Dados' }
      }
    ],
  },
  { path: '**', redirectTo: 'login' },
];
