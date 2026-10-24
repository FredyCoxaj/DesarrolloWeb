import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Api } from './api';
import { Route } from '../models';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private api = inject(Api);

  // MOCK local hasta que conectemos GET /routes real
  private mockRoutes: Route[] = [
    {
      id: 'r1',
      nombre: 'Amatitlán → Villa Nueva',
      origen: 'Amatitlán',
      destino: 'Villa Nueva',
      precioBase: 5.00,
      duracionMin: 35,
      activa: true,
      color: '#1E3A8A',
      imagen: 'img/rutas/bus-1.jpg',
      stops: [
        { id: 'p1', routeId: 'r1', nombre: 'Parque Central Amatitlán', latitud: 14.4769, longitud: -90.6347, orden: 1, esTerminal: false },
        { id: 'p2', routeId: 'r1', nombre: 'Mercado Municipal', latitud: 14.4805, longitud: -90.6280, orden: 2, esTerminal: false },
        { id: 'p3', routeId: 'r1', nombre: 'Entrada Villa Nueva', latitud: 14.5250, longitud: -90.5870, orden: 3, esTerminal: true },
      ],
    },
    {
      id: 'r2',
      nombre: 'Villa Nueva → Zona 12',
      origen: 'Villa Nueva',
      destino: 'Zona 12',
      precioBase: 7.50,
      duracionMin: 45,
      activa: true,
      color: '#1E3A8A',
      imagen: 'img/rutas/bus-2.jpg',
      stops: [
        { id: 'p4', routeId: 'r2', nombre: 'Centro Villa Nueva', latitud: 14.5250, longitud: -90.5870, orden: 1, esTerminal: false },
        { id: 'p5', routeId: 'r2', nombre: 'Calzada Aguilar Batres', latitud: 14.5800, longitud: -90.5500, orden: 2, esTerminal: false },
        { id: 'p6', routeId: 'r2', nombre: 'Zona 12', latitud: 14.5950, longitud: -90.5400, orden: 3, esTerminal: true },
      ],
    },
    {
      id: 'r3',
      nombre: 'Amatitlán → Mixco',
      origen: 'Amatitlán',
      destino: 'Mixco',
      precioBase: 10.00,
      duracionMin: 60,
      activa: true,
      color: '#1E3A8A',
      imagen: 'img/rutas/bus-3.jpg',
      stops: [
        { id: 'p7', routeId: 'r3', nombre: 'Parque Amatitlán', latitud: 14.4769, longitud: -90.6347, orden: 1, esTerminal: false },
        { id: 'p8', routeId: 'r3', nombre: 'San Miguel Petapa', latitud: 14.5020, longitud: -90.5610, orden: 2, esTerminal: false },
        { id: 'p9', routeId: 'r3', nombre: 'Mixco', latitud: 14.6350, longitud: -90.6100, orden: 3, esTerminal: true },
      ],
    },
    {
      id: 'r4',
      nombre: 'Amatitlán → San Miguel Petapa',
      origen: 'Amatitlán',
      destino: 'San Miguel Petapa',
      precioBase: 4.00,
      duracionMin: 25,
      activa: true,
      color: '#1E3A8A',
      imagen: 'img/rutas/bus-4.jpg',
      stops: [
        { id: 'p10', routeId: 'r4', nombre: 'Parque Amatitlán', latitud: 14.4769, longitud: -90.6347, orden: 1, esTerminal: false },
        { id: 'p11', routeId: 'r4', nombre: 'San Miguel Petapa', latitud: 14.5020, longitud: -90.5610, orden: 2, esTerminal: true },
      ],
    },
  ];

  getAll(): Observable<Route[]> {
    // Cuando conectemos backend: return this.api.get<Route[]>('/routes');
    return of(this.mockRoutes);
  }

  getById(id: string): Observable<Route | undefined> {
    // Cuando conectemos backend: return this.api.get<Route>(`/routes/${id}`);
    return of(this.mockRoutes.find((r) => r.id === id));
  }
}