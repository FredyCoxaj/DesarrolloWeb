import { Routes } from '@angular/router';
import { PassengerLayout } from './layouts/passenger-layout/passenger-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Mapa } from './features/pasajero/mapa/mapa/mapa';
import { PncVerification } from './features/auth/pnc-verification/pnc-verification';
import { RutasList } from './features/pasajero/rutas/rutas-list/rutas-list';
import { RutaDetail } from './features/pasajero/rutas/ruta-detail/ruta-detail';
//import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pasajero/mapa', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'pnc', component: PncVerification },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  },
  {
    path: 'pasajero',
    component: PassengerLayout,
    //canActivate: [authGuard],
    children: [
      { path: 'mapa', component: Mapa },
      { path: 'rutas', component: RutasList },
      { path: 'rutas/:id', component: RutaDetail },
      { path: '', redirectTo: 'mapa', pathMatch: 'full' },
    ]
  },
];