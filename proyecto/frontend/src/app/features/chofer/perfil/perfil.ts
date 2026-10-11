import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoferService } from '../../../core/services/chofer.service';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-chofer-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class ChoferPerfil {
  private choferService = inject(ChoferService);
  private auth = inject(Auth);

  readonly chofer = this.choferService.choferProfile;

  logout() {
    this.auth.logout();
  }
}
