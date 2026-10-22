import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Api } from './api';
import { Route } from '../models';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private api = inject(Api);

  // MOCK mientras Fernanda entrega GET /routes
  private mockRoutes: Route[] = [
    {
      id: 'r1',
      nombre: 'Amatitlán → Villa Nueva',
      origen: 'Amatitlán',
      destino: 'Villa Nueva',
      precio: 5.00,
      duracionMin: 35,
      imagen: 'img/rutas/bus-1.jpg',
      paradas: [
        { id: 'p1', nombre: 'Parque Central Amatitlán', lat: 14.4769, lng: -90.6347, orden: 1 },
        { id: 'p2', nombre: 'Mercado Municipal', lat: 14.4805, lng: -90.6280, orden: 2 },
        { id: 'p3', nombre: 'Entrada Villa Nueva', lat: 14.5250, lng: -90.5870, orden: 3 },
      ],
    },
    {
      id: 'r2',
      nombre: 'Villa Nueva → Zona 12',
      origen: 'Villa Nueva',
      destino: 'Zona 12',
      precio: 7.50,
      duracionMin: 45,
      imagen: 'img/rutas/bus-2.jpg',
      paradas: [
        { id: 'p4', nombre: 'Centro Villa Nueva', lat: 14.5250, lng: -90.5870, orden: 1 },
        { id: 'p5', nombre: 'Calzada Aguilar Batres', lat: 14.5800, lng: -90.5500, orden: 2 },
        { id: 'p6', nombre: 'Zona 12', lat: 14.5950, lng: -90.5400, orden: 3 },
      ],
    },
    {
      id: 'r3',
      nombre: 'Amatitlán → Mixco',
      origen: 'Amatitlán',
      destino: 'Mixco',
      precio: 10.00,
      duracionMin: 60,
      imagen: 'img/rutas/bus-3.jpg',
      paradas: [
        { id: 'p7', nombre: 'Parque Amatitlán', lat: 14.4769, lng: -90.6347, orden: 1 },
        { id: 'p8', nombre: 'San Miguel Petapa', lat: 14.5020, lng: -90.5610, orden: 2 },
        { id: 'p9', nombre: 'Mixco', lat: 14.6350, lng: -90.6100, orden: 3 },
      ],
    },
    {
      id: 'r4',
      nombre: 'Amatitlán → San Miguel Petapa',
      origen: 'Amatitlán',
      destino: 'San Miguel Petapa',
      precio: 4.00,
      duracionMin: 25,
      imagen: 'img/rutas/bus-4.jpg',
      paradas: [
        { id: 'p10', nombre: 'Parque Amatitlán', lat: 14.4769, lng: -90.6347, orden: 1 },
        { id: 'p11', nombre: 'San Miguel Petapa', lat: 14.5020, lng: -90.5610, orden: 2 },
      ],
    },
  ];

  getAll(): Observable<Route[]> {
    // Cuando el backend esté listo, cambia por:
    // return this.api.get<Route[]>('/routes');
    return of(this.mockRoutes);
  }

  getById(id: string): Observable<Route | undefined> {
    // Cuando el backend esté listo:
    // return this.api.get<Route>(`/routes/${id}`);
    return of(this.mockRoutes.find((r) => r.id === id));
  }
}