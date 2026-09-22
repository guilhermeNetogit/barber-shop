import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../login/service/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isSubmitting = signal(false);
  isLoading = signal(true);

  ocultarSenhaAtual = true;
  ocultarNovaSenha = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarUsuario();
  }

  private initForm(): void {
    this.profileForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        cpf: ['', [Validators.required]],
        senhaAtual: ['', [Validators.required]],
        novaSenha: ['', [Validators.minLength(6)]],
        confirmarNovaSenha: [''],
      },
      { validators: this.senhasIguaisValidator },
    );
  }

  private carregarUsuario(): void {
    this.userService.getMe().subscribe({
      next: (dados) => {
        this.profileForm.patchValue({
          name: dados.name,
          email: dados.email,
          cpf: dados.cpf,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Não foi possível carregar seus dados.', 'Fechar', { duration: 3000 });
      },
    });
  }

  private senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
    const novaSenha = control.get('novaSenha')?.value;
    const confirmarNovaSenha = control.get('confirmarNovaSenha')?.value;

    if (novaSenha && novaSenha !== confirmarNovaSenha) {
      return { senhasDiferentes: true };
    }
    return null;
  }

  salvarAlteracoes(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open('Verifique os campos do formulário.', 'Fechar', { duration: 3000 });
      return;
    }

    const { name, email, cpf, senhaAtual, novaSenha } = this.profileForm.value;
    const emailAlterado = email.trim().toLowerCase() !== this.profileForm.get('email')?.value;

    this.isSubmitting.set(true);

    this.userService
      .updateMe({
        name: name.trim(),
        email: email.trim(),
        cpf: cpf.trim(),
        currentPassword: senhaAtual,
        newPassword: novaSenha?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.snackBar.open('Dados atualizados com sucesso!', 'OK', { duration: 3000 });

          // e-mail ou senha mudaram -> o token atual pode ficar desatualizado, força novo login
          if (email !== this.profileForm.value.email || novaSenha) {
            this.authService.logout();
            this.router.navigate(['/login']);
            return;
          }

          setTimeout(() => this.router.navigate(['/schedules/month']), 1000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const mensagem = err.error?.message || 'Erro ao atualizar os dados.';
          this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/schedules/month']);
  }
}
