import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  templateUrl: './role-switcher.html',
  styleUrl: './role-switcher.scss',
})
export class RoleSwitcher {
  private auth = inject(Auth);
  private router = inject(Router);

  isOpen = false;
  currentRole = () => this.auth.currentUser()?.rol || 'PASAJERO';

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectRole(role: UserRole) {
    this.auth.switchRole(role);
    this.isOpen = false;

    if (role === 'CHOFER') {
      this.router.navigate(['/chofer/viaje-activo']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/pasajero/mapa']);
    }
  }
}
