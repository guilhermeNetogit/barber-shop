import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuBarComponent } from '../../commons/components/menu-bar/menu-bar.component';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CardHeaderComponent } from '../../commons/components/card-header/card-header.component';
import { Subscription, filter } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../login/service/auth.service';

@Component({
  selector: 'app-main-layout.component',
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, CardHeaderComponent, MenuBarComponent, MatDividerModule, MatMenuModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  title = signal<string>('Barber Shop');
  private routeSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  logout(): void {
    this.authService.logout();

    localStorage.removeItem('token');
    sessionStorage.clear();

    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    // Atualiza o título logo no carregamento inicial
    this.updateTitle();

    // Escuta a mudança de rotas para atualizar o título dinamicamente
    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private updateTitle(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const titleFromData = route.snapshot.data['title'];
    this.title.set(titleFromData || 'Barber Shop');
  }
}
