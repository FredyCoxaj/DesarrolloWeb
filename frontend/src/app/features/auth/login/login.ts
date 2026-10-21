import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  identifier = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onIdentifierInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Si empieza con dígito → es DPI, solo números, máximo 13
    if (/^\d/.test(value)) {
      const cleaned = value.replace(/\D/g, '').slice(0, 13);
      if (input.value !== cleaned) input.value = cleaned;
      this.identifier = cleaned;
    } else {
      // Es correo → limitar a 100 caracteres
      const cleaned = value.slice(0, 100);
      if (input.value !== cleaned) input.value = cleaned;
      this.identifier = cleaned;
    }
  }

  onSubmit() {
    if (!this.identifier || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ identifier: this.identifier, password: this.password })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/pasajero/mapa']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al iniciar sesión');
        }
      });
  }

  socialLogin(provider: string) {
    const nombres: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      apple: 'Apple',
    };
    this.error.set(`Inicio con ${nombres[provider]} estará disponible pronto`);
    setTimeout(() => this.error.set(null), 3000);
  }
}