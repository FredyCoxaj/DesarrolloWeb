import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideArrowRight],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  dpi = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  // Validación DPI: solo números, exactamente 13
  onDpiInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 13);
    if (input.value !== cleaned) input.value = cleaned;
    this.dpi = cleaned;
  }

  get dpiValido(): boolean {
    return /^\d{13}$/.test(this.dpi);
  }

  onSubmit() {
    if (!this.dpiValido || !this.password) {
      this.error.set('Completa todos los campos correctamente');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ dpi: this.dpi, password: this.password })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          // Redirección por rol
          const rol = res.user.rol;
          if (rol === 'ADMIN') this.router.navigate(['/admin/dashboard']);
          else if (rol === 'CHOFER') this.router.navigate(['/chofer/viaje']);
          else this.router.navigate(['/pasajero/mapa']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'DPI o contraseña incorrectos');
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