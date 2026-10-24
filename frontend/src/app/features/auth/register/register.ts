import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);

  dpi = '';
  nombre = '';
  apellido = '';
  email = '';
  password = '';
  telefono = '';
  fechaNacimiento = '';

  loading = signal(false);
  error = signal<string | null>(null);

  // Validacion DPI: exactamente 13 digitos numericos
  get dpiValido(): boolean {
    return /^\d{13}$/.test(this.dpi);
  }

  get dpiError(): string | null {
    if (this.dpi.length === 0) return null;
    if (this.dpi.length < 13) return `Faltan ${13 - this.dpi.length} dígitos`;
    if (!/^\d{13}$/.test(this.dpi)) return 'El DPI solo debe tener números';
    return null;
  }

  onDpiInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 13);

    // Fuerza el valor limpio en el DOM
    if (input.value !== cleaned) {
      input.value = cleaned;
    }

    this.dpi = cleaned;
  }

  onSubmit() {
    if (!this.dpiValido) {
      this.error.set('El DPI debe tener 13 dígitos');
      return;
    }
    if (!this.nombre || !this.apellido || !this.email || !this.password || !this.fechaNacimiento) {
      this.error.set('Completa todos los campos obligatorios');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.register({
      dpi: this.dpi,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/pnc']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Error al registrarse');
      }
    });
  }
}