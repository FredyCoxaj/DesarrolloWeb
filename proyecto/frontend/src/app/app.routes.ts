import { Routes } from '@angular/router';
import { PassengerLayout } from './layouts/passenger-layout/passenger-layout';
import { Mapa } from './features/pasajero/mapa/mapa/mapa';
//import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pasajero/mapa', pathMatch: 'full' },
  {
    path: 'pasajero',
    component: PassengerLayout,
    //canActivate: [authGuard],
    children: [
      { path: 'mapa', component: Mapa },
      { path: '', redirectTo: 'mapa', pathMatch: 'full' },
    ]
  },
];