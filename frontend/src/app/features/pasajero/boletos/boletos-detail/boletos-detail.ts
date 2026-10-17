import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketsService } from '../../../../core/services/tickets';
import { Ticket } from '../../../../core/models';

@Component({
  selector: 'app-boletos-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './boletos-detail.html',
  styleUrl: './boletos-detail.scss'
})
export class BoletosDetail implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketsService = inject(TicketsService);

  ticket = signal<Ticket | null>(null);
  notFound = signal(false);
  showCancelConfirm = signal(false);

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      return;
    }
    const t = this.ticketsService.getById(id);
    if (t) {
      this.ticket.set(t);
    } else {
      this.notFound.set(true);
    }
  }

  get puedeCancelar(): boolean {
    const t = this.ticket();
    return !!t && (t.estado === 'RESERVADO' || t.estado === 'PAGADO');
  }

  confirmarCancelacion() {
    const t = this.ticket();
    if (!t) return;
    this.ticketsService.cancel(t.id);
    this.ticket.set({ ...t, estado: 'CANCELADO' });
    this.showCancelConfirm.set(false);
  }

  volver() {
    this.router.navigate(['/pasajero/boletos']);
  }

  estadoLabel(estado: Ticket['estado']): string {
    const map: Record<Ticket['estado'], string> = {
      RESERVADO: 'Reservado',
      PAGADO: 'Pagado',
      ABORDADO: 'Abordado',
      CANCELADO: 'Cancelado',
    };
    return map[estado];
  }

  formatFecha(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}