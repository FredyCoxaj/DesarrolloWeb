import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoutesService } from '../../../../core/services/routes';
import { Route } from '../../../../core/models';

@Component({
  selector: 'app-rutas-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './rutas-list.html',
  styleUrl: './rutas-list.scss'
})
export class RutasList {
  private routesService = inject(RoutesService);

  allRoutes = signal<Route[]>([]);
  filtroOrigen = signal('');
  filtroDestino = signal('');

  filteredRoutes = computed(() => {
    const origen = this.filtroOrigen().toLowerCase().trim();
    const destino = this.filtroDestino().toLowerCase().trim();

    return this.allRoutes().filter((r) => {
      const matchOrigen = !origen || r.origen.toLowerCase().includes(origen);
      const matchDestino = !destino || r.destino.toLowerCase().includes(destino);
      return matchOrigen && matchDestino;
    });
  });

  ngOnInit() {
    this.routesService.getAll().subscribe((routes) => {
      this.allRoutes.set(routes);
    });
  }

  limpiarFiltros() {
    this.filtroOrigen.set('');
    this.filtroDestino.set('');
  }
}