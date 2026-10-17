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
}