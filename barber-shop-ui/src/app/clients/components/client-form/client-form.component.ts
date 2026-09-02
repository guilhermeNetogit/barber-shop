import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { ClientModelForm } from '../../client.models';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-form',
  imports: [FormsModule, MatInputModule, MatFormFieldModule, NgxMaskDirective,
  MatButtonModule,
  MatIconModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent {
  constructor(private readonly router: Router) {}

  client: ClientModelForm = { id: 0, name: '', email: '', phone: '' };

  @Input('client')
  set clientData(value: ClientModelForm) {
    if (value) {
      Object.assign(this.client, value);
    }
  }

  @Output() clientSubmited = new EventEmitter<ClientModelForm>();

  onSubmit(form: NgForm) {
    console.log('1. Botão clicado no filho! Form válido?', form.valid);
    console.log('2. Dados do cliente:', this.client);
    if (form.valid) {
      this.clientSubmited.emit(this.client);
    }
  }

  onCancel() {
    this.router.navigate(['clients/list']);
  }
}
