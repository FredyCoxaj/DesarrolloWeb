import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TicketsService } from '../../../../core/services/tickets';
import { Ticket } from '../../../../core/models';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

type Tab = 'activos' | 'pasados' | 'cancelados';

@Component({
  selector: 'app-boletos-list',
  standalone: true,
  imports: [RouterLink, EmptyState, Skeleton],
  templateUrl: './boletos-list.html',
  styleUrl: './boletos-list.scss'
})

export class BoletosList implements OnInit {
  private ticketsService = inject(TicketsService);
  private router = inject(Router);

  tab = signal<Tab>('activos');
  allTickets = signal<Ticket[]>([]);
  loading = signal(true);

  filteredTickets = computed(() => {
    const t = this.tab();
    const tickets = this.allTickets();
    if (t === 'activos') {
      return tickets.filter((x) => x.estado === 'RESERVADO' || x.estado === 'PAGADO');
    }
    if (t === 'pasados') {
      return tickets.filter((x) => x.estado === 'ABORDADO');
    }
    return tickets.filter((x) => x.estado === 'CANCELADO');
  });

  counts = computed(() => ({
    activos: this.allTickets().filter((x) => x.estado === 'RESERVADO' || x.estado === 'PAGADO').length,
    pasados: this.allTickets().filter((x) => x.estado === 'ABORDADO').length,
    cancelados: this.allTickets().filter((x) => x.estado === 'CANCELADO').length,
  }));

  ngOnInit() {
    this.ticketsService.getAll().subscribe((tickets) => {
      this.allTickets.set(tickets);
      this.loading.set(false);
    });
  }

  setTab(t: Tab) {
    this.tab.set(t);
  }

  irARutas() {
    this.router.navigate(['/pasajero/rutas']);
  }

  estadoLabel(estado: Ticket['estado']): string {
  const map: Record<Ticket['estado'], string> = {
    RESERVADO: 'Reservado',
    PAGADO: 'Pagado',
    ABORDADO: 'Abordado',
    CANCELADO: 'Cancelado',
    NO_SHOW: 'No se presentó', 
  };
  return map[estado];
}

  estadoColor(estado: Ticket['estado']): string {
  const map: Record<Ticket['estado'], string> = {
    RESERVADO: 'bg-yellow-100 text-yellow-700',
    PAGADO: 'bg-blue-100 text-blue-700',
    ABORDADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-gray-200 text-gray-600',
    NO_SHOW: 'bg-red-100 text-red-700',   
  };
  return map[estado];
}

  formatFecha(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-GT', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}