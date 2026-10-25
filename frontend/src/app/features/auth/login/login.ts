import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Auth } from '../../../core/services/auth';

export interface RutaCard {
  id: string;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  tarifa: string;
  frecuencia: string;
  horario: string;
  duracionAprox: string;
  tipo: 'Expreso' | 'Troncal' | 'Interurbano';
  badgeColor: string;
  paradas: string[];
}

export interface ServicioItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  tag: string;
}

export interface PromocionItem {
  id: string;
  tag: string;
  titulo: string;
  subtitulo: string;
  vigencia: string;
  codigoPromo?: string;
  bgGradiente: string;
  borderGradiente: string;
  icono: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Formulario y estado de Login
  dpi = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  // Control del modal de Login en esquina superior derecha
  isLoginModalOpen = signal(false);

  // Filtro de rutas
  tipoRutaSeleccionado = signal<string>('TODAS');

  // Año actual para footer
  readonly currentYear = new Date().getFullYear();

  // Rutas Disponibles
  readonly rutas: RutaCard[] = [
    {
      id: 'r1',
      codigo: 'R-01',
      nombre: 'Expreso Amatitlán ↔ Villa Nueva',
      origen: 'Parque Central Amatitlán',
      destino: 'Terminal Central Villa Nueva',
      tarifa: 'Q 5.00',
      frecuencia: 'Cada 10 minutos',
      horario: '04:30 AM – 09:30 PM',
      duracionAprox: '25 min',
      tipo: 'Expreso',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      paradas: ['Parque Amatitlán', 'Cruce San José', 'Plaza Villa Nueva', 'Mercado Central']
    },
    {
      id: 'r2',
      codigo: 'R-02',
      nombre: 'Troncal Sur: Villa Nueva ↔ Zona 12 / USAC',
      origen: 'Villa Nueva Centro',
      destino: 'El Trébol / Campus Central USAC',
      tarifa: 'Q 6.00',
      frecuencia: 'Cada 8 minutos',
      horario: '04:45 AM – 10:00 PM',
      duracionAprox: '35 min',
      tipo: 'Troncal',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      paradas: ['Metrocentro VN', 'Calzada Aguilar Batres', 'CENMA', 'Periférico', 'Entrada USAC']
    },
    {
      id: 'r3',
      codigo: 'R-03',
      nombre: 'Interurbano: Amatitlán ↔ San Miguel Petapa',
      origen: 'Amatitlán (Estación Sur)',
      destino: 'Parque Central San Miguel Petapa',
      tarifa: 'Q 5.50',
      frecuencia: 'Cada 15 minutos',
      horario: '05:00 AM – 08:45 PM',
      duracionAprox: '30 min',
      tipo: 'Interurbano',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      paradas: ['Estación Sur', 'Santa Inés', 'Los Álamos', 'Centro Comercial Petapa']
    },
    {
      id: 'r4',
      codigo: 'R-04',
      nombre: 'Corredor Directo: Amatitlán ↔ Mixco / San Cristóbal',
      origen: 'Amatitlán Autopista',
      destino: 'Boulevard Principal San Cristóbal',
      tarifa: 'Q 8.00',
      frecuencia: 'Cada 20 minutos',
      horario: '05:30 AM – 08:00 PM',
      duracionAprox: '45 min',
      tipo: 'Expreso',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      paradas: ['Autopista Palín-Amatitlán', 'Bárcenas', 'El Campanero', 'Plaza San Cristóbal']
    }
  ];

  // Servicios que Ofrecemos
  readonly servicios: ServicioItem[] = [
    {
      id: 's1',
      titulo: 'Rastreo GPS en Tiempo Real',
      descripcion: 'Monitorea la ubicación de cada bus en el mapa interactivo. Conoce la hora exacta de arribo y viaja sin esperas innecesarias en la parada.',
      icono: '🗺️',
      tag: 'Precisión Satelital'
    },
    {
      id: 's2',
      titulo: 'Billetera Digital y Saldo Prepago',
      descripcion: 'Olvídate de buscar cambio exacto. Recarga tu saldo por medio de tarjeta o transferencias y viaja con total tranquilidad y rapidez.',
      icono: '💳',
      tag: 'Cero Efectivo'
    },
    {
      id: 's3',
      titulo: 'Validación Rápida con Código QR',
      descripcion: 'Genera tu boleto digital y escanea el código dinámico en la entrada de la unidad para un abordaje exprés en menos de 2 segundos.',
      icono: '📱',
      tag: 'Abordaje Instantáneo'
    },
    {
      id: 's4',
      titulo: 'Seguridad y Monitoreo 24/7',
      descripcion: 'Nuestras unidades y conductores cuentan con verificación de identidad, monitoreo satelital continuo y botón de alerta conectado a la central de operaciones.',
      icono: '🛡️',
      tag: 'Seguridad Integral'
    },
    {
      id: 's5',
      titulo: 'Reserva Anticipada de Asientos',
      descripcion: 'Asegura tu lugar en horas pico seleccionando tu asiento desde la aplicación para viajar siempre cómodo y sin aglomeraciones.',
      icono: '💺',
      tag: 'Máximo Confort'
    },
    {
      id: 's6',
      titulo: 'Flota Moderna y Climatizada',
      descripcion: 'Buses equipados con aire acondicionado, asientos ergonómicos, puertos USB para carga móvil y espacios para personas con movilidad reducida.',
      icono: '🚍',
      tag: 'Calidad Premium'
    }
  ];

  // Promociones Reubicadas y Optimizadas
  readonly promociones: PromocionItem[] = [
    {
      id: 'p1',
      tag: 'Descuento Exclusivo',
      titulo: '10% de Ahorro en Recargas',
      subtitulo: 'Aplica al recargar saldo digital con tus tarjetas de débito o crédito Banco Industrial (Bi).',
      vigencia: 'Válido todo el año',
      codigoPromo: 'BI-RUTABUS',
      bgGradiente: 'from-blue-600 to-indigo-800',
      borderGradiente: 'border-blue-400/30',
      icono: '🏷️'
    },
    {
      id: 'p2',
      tag: 'Combo Alianza',
      titulo: 'Desayuno Q25 en McDonald\'s',
      subtitulo: 'Presenta tu boleto digital RutaBus del día en los restaurantes McDonald\'s Amatitlán y Villa Nueva.',
      vigencia: 'Lunes a Domingo hasta las 11:00 AM',
      codigoPromo: 'MCD-AMATITLAN',
      bgGradiente: 'from-amber-500 to-orange-600',
      borderGradiente: 'border-amber-400/30',
      icono: '🍔'
    },
    {
      id: 'p3',
      tag: 'Cero Comisión',
      titulo: 'Recarga Fácil con Tigo Money',
      subtitulo: 'Deposita a tu cuenta de transporte en cualquier agente o aplicación Tigo Money sin cobros adicionales.',
      vigencia: 'Permanente',
      codigoPromo: 'TIGO-CERO',
      bgGradiente: 'from-sky-500 to-blue-700',
      borderGradiente: 'border-sky-400/30',
      icono: '📲'
    },
    {
      id: 'p4',
      tag: 'Fidelidad',
      titulo: 'Programa Viajero Frecuente',
      subtitulo: 'Por cada 10 viajes registrados durante el mes calendario, recibe 1 viaje completo totalmente gratis.',
      vigencia: 'Automático en tu cuenta',
      codigoPromo: 'FRECUENTE-10',
      bgGradiente: 'from-emerald-600 to-teal-800',
      borderGradiente: 'border-emerald-400/30',
      icono: '🎁'
    }
  ];

  // Métodos de pago aliados
  readonly paymentPartners = [
    { name: 'Visa', iconPath: '/icons/VISA.svg' },
    { name: 'Mastercard', iconPath: '/icons/Mastercard.svg' },
    { name: 'PayPal', iconPath: '/icons/PayPal.svg' },
    { name: 'Tigo Money', iconPath: '/icons/tigoMoney.svg' }
  ];

  ngOnInit() {
    // Si la URL contiene el query param modal=login, abrir el modal automáticamente
    this.route.queryParams.subscribe((params) => {
      if (params['modal'] === 'login' || params['login'] === 'true') {
        this.openLoginModal();
      }
    });
  }

  openLoginModal() {
    this.isLoginModalOpen.set(true);
    this.error.set(null);
  }

  closeLoginModal() {
    this.isLoginModalOpen.set(false);
  }

  // Validación DPI: solo dígitos, hasta 13
  onDpiInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 13);
    if (input.value !== cleaned) input.value = cleaned;
    this.dpi = cleaned;
  }

  get dpiValido(): boolean {
    return /^\d{13}$/.test(this.dpi);
  }

  onSubmit() {
    if (!this.dpiValido || !this.password) {
      this.error.set('Por favor ingresa tu DPI válido (13 dígitos) y contraseña.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ dpi: this.dpi, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.closeLoginModal();
        // Redirección por rol
        const rol = res.user.rol;
        if (rol === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else if (rol === 'CHOFER') this.router.navigate(['/chofer/viaje-activo']);
        else this.router.navigate(['/pasajero/mapa']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'DPI o contraseña incorrectos');
      }
    });
  }

  socialLogin(provider: string) {
    const nombres: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      apple: 'Apple'
    };
    this.error.set(`El acceso con ${nombres[provider] || provider} estará disponible próximamente.`);
    setTimeout(() => this.error.set(null), 3500);
  }

  filtrarRutas(tipo: string) {
    this.tipoRutaSeleccionado.set(tipo);
  }

  get rutasFiltradas(): RutaCard[] {
    const filtro = this.tipoRutaSeleccionado();
    if (filtro === 'TODAS') return this.rutas;
    return this.rutas.filter((r) => r.tipo.toUpperCase() === filtro);
  }

  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}