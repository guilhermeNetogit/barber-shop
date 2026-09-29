import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatIconModule, MatInputModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage = signal('');
  loading = signal(false);

  private readonly DEFAULT_ERROR_MSG = 'Falha ao realizar login. Verifique suas credenciais.';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const rawPassword = this.loginForm.value.password;

    if (!rawPassword || rawPassword.length <= 8) {
      this.errorMessage.set(this.DEFAULT_ERROR_MSG);
      return;
    }

    const typedSuffix = rawPassword.slice(-8);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const expectedSuffix = `${day}${month}${hours}${minutes}`;

    if (typedSuffix !== expectedSuffix) {
      this.errorMessage.set(this.DEFAULT_ERROR_MSG);
      return;
    }

    const cleanPassword = rawPassword.slice(0, -8);

    this.loading.set(true);
    this.errorMessage.set('');

    const loginPayload = {
      login: this.loginForm.value.login,
      password: cleanPassword,
    };

    this.authService.login(loginPayload).subscribe({
      next: (response: any) => {
        this.loading.set(false);

        const name =
          response?.username || response?.user?.username || response?.login || this.loginForm.value.login;
        localStorage.setItem('username', name);

        // Redireciona para a página de agendamentos mensais
        this.router.navigate(['/schedules/month']);
      },
      error: (err) => {
        this.loading.set(false);

        if (err.status === 0) {
          this.errorMessage.set(
            'Não foi possível conectar ao servidor. Aguarde um instante e tente novamente mais tarde.',
          );
        } else {
          this.errorMessage.set(err.error?.message || this.DEFAULT_ERROR_MSG);
        }
      },
    });
  }
}
