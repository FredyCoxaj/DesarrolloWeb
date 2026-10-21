import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Service {
  name: string;
  icon: string;
}

interface Ad {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  bgClass: string;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss'
})
export class AuthLayout {
  services: Service[] = [
    { name: 'Visa', icon: '💳' },
    { name: 'BI', icon: '🏦' },
    { name: 'Tigo Money', icon: '📱' },
    { name: 'Uber', icon: '🚗' },
  ];

  ads: Ad[] = [
    {
      id: 'a1',
      tag: 'Promo',
      title: '10% de descuento',
      subtitle: 'Pagando con tarjeta BI',
      bgClass: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
    {
      id: 'a2',
      tag: 'Combo',
      title: 'Desayuno Q25',
      subtitle: 'En McDonald\'s Amatitlán',
      bgClass: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    },
    {
      id: 'a3',
      tag: 'Nuevo',
      title: 'Recarga tu tarjeta',
      subtitle: 'Con Tigo Money sin comisión',
      bgClass: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    {
      id: 'a4',
      tag: 'Ruta nueva',
      title: 'Amatitlán → Mixco',
      subtitle: 'Directo, sin transbordos',
      bgClass: 'bg-gradient-to-br from-green-500 to-teal-600',
    },
  ];
}