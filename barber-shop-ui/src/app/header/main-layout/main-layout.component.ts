import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuBarComponent } from '../../commons/components/menu-bar/menu-bar.component';
import { RouterOutlet } from '@angular/router';
import { CardHeaderComponent } from '../../commons/components/card-header/card-header.component';

@Component({
  selector: 'app-main-layout.component',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    CardHeaderComponent,
    MenuBarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  title = signal('Barber Shop');
}
