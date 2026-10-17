import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoferService } from '../../../core/services/chofer.service';

@Component({
  selector: 'app-chofer-ganancias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ganancias.html',
  styleUrl: './ganancias.scss',
})
export class ChoferGanancias {
  private choferService = inject(ChoferService);

  readonly cobros = this.choferService.cobrosHistorial;
  readonly chofer = this.choferService.choferProfile;

  readonly summary = computed(() => this.choferService.getGananciasSummary());
}
