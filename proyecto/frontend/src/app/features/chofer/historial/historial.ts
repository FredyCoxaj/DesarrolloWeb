import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoferService } from '../../../core/services/chofer.service';

@Component({
  selector: 'app-chofer-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class ChoferHistorial {
  private choferService = inject(ChoferService);
  readonly historial = this.choferService.viajesHistorial;
}
