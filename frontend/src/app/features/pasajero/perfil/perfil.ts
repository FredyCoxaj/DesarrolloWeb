import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../core/services/users';
import { Auth } from '../../../core/services/auth';
import { User } from '../../../core/models';
import { LucidePencil, LucideCircleX } from '@lucide/angular';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, LucidePencil, LucideCircleX],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  private usersService = inject(UsersService);
  private auth = inject(Auth);
  private router = inject(Router);

  user = signal<User | null>(null);
  editing = signal(false);
  saving = signal(false);
  message = signal<{ type: 'ok' | 'error'; text: string } | null>(null);

  nombre = '';
  email = '';
  telefono = '';

  ngOnInit() {
    this.usersService.getMe().subscribe((u) => {
      this.user.set(u);
      this.nombre = u.nombre;
      this.email = u.email;
      this.telefono = u.telefono || '';
    });
  }

  get iniciales(): string {
    const n = this.user()?.nombre || '';
    return n
      .split(' ')
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  iniciarEdicion() {
    this.editing.set(true);
    this.message.set(null);
  }

  cancelar() {
    const u = this.user();
    if (u) {
      this.nombre = u.nombre;
      this.email = u.email;
      this.telefono = u.telefono || '';
    }
    this.editing.set(false);
    this.message.set(null);
  }

  guardar() {
    if (!this.nombre || !this.email) {
      this.message.set({ type: 'error', text: 'Nombre y correo son obligatorios' });
      return;
    }

    this.saving.set(true);
    this.usersService
      .updateMe({
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
      })
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.editing.set(false);
          this.saving.set(false);
          this.message.set({ type: 'ok', text: 'Perfil actualizado' });
          setTimeout(() => this.message.set(null), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.message.set({ type: 'error', text: 'Error al guardar' });
        },
      });
  }

  cerrarSesion() {
    this.auth.logout();
  }
}
