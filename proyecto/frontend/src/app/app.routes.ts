import { Routes } from '@angular/router';
import { PassengerLayout } from './layouts/passenger-layout/passenger-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Mapa } from './features/pasajero/mapa/mapa/mapa';
import { PncVerification } from './features/auth/pnc-verification/pnc-verification';
import { RutasList } from './features/pasajero/rutas/rutas-list/rutas-list';
import { RutaDetail } from './features/pasajero/rutas/ruta-detail/ruta-detail';

// Layouts Track C (Renato)
import { ChoferLayout } from './layouts/chofer-layout/chofer-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Features Chofer Track C
import { ViajeActivo } from './features/chofer/viaje-activo/viaje-activo';
import { ChoferGanancias } from './features/chofer/ganancias/ganancias';
import { ChoferHistorial } from './features/chofer/historial/historial';
import { ChoferPerfil } from './features/chofer/perfil/perfil';

// Features Admin Track C
import { AdminDashboard } from './features/admin/dashboard/dashboard';
import { AdminMapa } from './features/admin/mapa/mapa';
import { AdminFlota } from './features/admin/flota/flota';
import { AdminChoferes } from './features/admin/choferes/choferes';
import { AdminReportes } from './features/admin/reportes/reportes';
import { AdminAlertas } from './features/admin/alertas/alertas';

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
    ],
  },
  {
    path: 'pasajero',
    component: PassengerLayout,
    children: [
      { path: 'mapa', component: Mapa },
      { path: 'rutas', component: RutasList },
      { path: 'rutas/:id', component: RutaDetail },
      { path: '', redirectTo: 'mapa', pathMatch: 'full' },
    ],
  },
  // Track C: Módulo Chofer (F3, F4, F5, F6, F7)
  {
    path: 'chofer',
    component: ChoferLayout,
    children: [
      { path: 'viaje-activo', component: ViajeActivo },
      { path: 'ganancias', component: ChoferGanancias },
      { path: 'historial', component: ChoferHistorial },
      { path: 'perfil', component: ChoferPerfil },
      { path: '', redirectTo: 'viaje-activo', pathMatch: 'full' },
    ],
  },
  // Track C: Módulo Administrador (F8, F9, F10, F11, F12, F13)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'mapa', component: AdminMapa },
      { path: 'flota', component: AdminFlota },
      { path: 'choferes', component: AdminChoferes },
      { path: 'reportes', component: AdminReportes },
      { path: 'alertas', component: AdminAlertas },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'pasajero/mapa' },
];