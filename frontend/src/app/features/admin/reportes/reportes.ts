import { Component, DestroyRef, ElementRef, afterRenderEffect, computed, inject, signal, viewChild } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Chart, registerables } from 'chart.js';
import {
  CategoriaIncidente,
  DIAS_HISTORIAL,
  MUNICIPIOS,
  Severidad,
  generarIncidentes,
  generarRegistros,
  sumarDias,
  toIsoDate,
} from './reportes.data';

Chart.register(...registerables);

type Periodo = 'HOY' | 'AYER' | '7D' | '30D' | 'MES' | 'ANIO' | 'CUSTOM';
type Desempeno = '' | 'TOP5' | 'BAJO' | 'MAS200';

const COLORES = ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#0284C7'];

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
  host: { '(document:click)': 'cerrarDesplegables($event)' },
})
export class AdminReportes {
  private admin = inject(AdminService);
  private host = inject(ElementRef<HTMLElement>);

  private readonly buses = this.admin.busRevenueSummaries;
  private readonly registros = computed(() => generarRegistros(this.buses()));
  private readonly incidentes = computed(() => generarIncidentes(this.buses()));

  // ---------- Opciones ----------
  readonly hoy = toIsoDate(new Date());
  readonly fechaMinima = sumarDias(this.hoy, -(DIAS_HISTORIAL - 1));
  readonly municipios = MUNICIPIOS;

  readonly periodos: { id: Periodo; label: string }[] = [
    { id: 'HOY', label: 'Hoy' },
    { id: 'AYER', label: 'Ayer' },
    { id: '7D', label: 'Últimos 7 días' },
    { id: '30D', label: 'Últimos 30 días' },
    { id: 'MES', label: 'Este mes' },
    { id: 'ANIO', label: 'Año a la fecha' },
    { id: 'CUSTOM', label: 'Personalizado' },
  ];

  readonly opcionesDesempeno: { id: Exclude<Desempeno, ''>; label: string }[] = [
    { id: 'TOP5', label: 'Top 5 ingresos' },
    { id: 'BAJO', label: 'Menor rendimiento' },
    { id: 'MAS200', label: 'Más de 200 viajes' },
  ];

  readonly categorias: { id: CategoriaIncidente | 'TODAS'; label: string }[] = [
    { id: 'TODAS', label: 'Todas' },
    { id: 'TRAFICO', label: 'Problemas Operativos (Tráfico)' },
    { id: 'MECANICA', label: 'Fallas Mecánicas' },
    { id: 'USUARIO', label: 'Factores del Usuario' },
  ];

  readonly severidades: Severidad[] = ['ALTA', 'MEDIA', 'BAJA'];

  // ---------- Estado de los filtros ----------
  readonly periodo = signal<Periodo>('30D');
  readonly fechaDesde = signal(sumarDias(this.hoy, -29));
  readonly fechaHasta = signal(this.hoy);
  readonly municipio = signal('');
  readonly rutasSeleccionadas = signal<string[]>([]);
  readonly busqueda = signal('');
  readonly placasSeleccionadas = signal<string[]>([]);
  readonly desempeno = signal<Desempeno>('');
  readonly categoria = signal<CategoriaIncidente | 'TODAS'>('TODAS');
  readonly severidad = signal<Severidad | ''>('');

  // ---------- Datos derivados ----------

  /** Rango de fechas (inclusivo) según el período elegido. */
  readonly rango = computed(() => {
    const hoy = this.hoy;
    switch (this.periodo()) {
      case 'HOY': return { desde: hoy, hasta: hoy };
      case 'AYER': return { desde: sumarDias(hoy, -1), hasta: sumarDias(hoy, -1) };
      case '7D': return { desde: sumarDias(hoy, -6), hasta: hoy };
      case '30D': return { desde: sumarDias(hoy, -29), hasta: hoy };
      case 'MES': return { desde: hoy.slice(0, 8) + '01', hasta: hoy };
      case 'ANIO': return { desde: hoy.slice(0, 5) + '01-01', hasta: hoy };
      case 'CUSTOM': {
        const a = this.fechaDesde();
        const b = this.fechaHasta();
        return a <= b ? { desde: a, hasta: b } : { desde: b, hasta: a };
      }
    }
  });

  /** Rutas que pasan por el municipio elegido. */
  readonly rutasDisponibles = computed(() => {
    const m = this.municipio();
    const rutas = [...new Set(this.buses().map((b) => b.rutaNombre))];
    return m ? rutas.filter((r) => r.includes(m)) : rutas;
  });

  readonly todasLasPlacas = computed(() => this.buses().map((b) => b.placa));

  /** Filas de la tabla: filtros globales + filtros de tabla. También alimentan la gráfica. */
  readonly filas = computed(() => {
    const { desde, hasta } = this.rango();
    const municipio = this.municipio();
    const rutas = this.rutasSeleccionadas();

    // 1. Filtros globales (municipio y ruta)
    const buses = this.buses().filter(
      (b) => (!municipio || b.rutaNombre.includes(municipio)) && (rutas.length === 0 || rutas.includes(b.rutaNombre))
    );

    // Totales del período por bus
    const totales = new Map<string, { ingresos: number; viajes: number }>();
    for (const r of this.registros()) {
      if (r.fecha < desde || r.fecha > hasta) continue;
      const t = totales.get(r.busId) ?? { ingresos: 0, viajes: 0 };
      t.ingresos += r.ingresos;
      t.viajes += r.viajes;
      totales.set(r.busId, t);
    }

    let filas = buses.map((b) => ({
      busId: b.busId,
      placa: b.placa,
      rutaNombre: b.rutaNombre,
      ingresos: totales.get(b.busId)?.ingresos ?? 0,
      viajes: totales.get(b.busId)?.viajes ?? 0,
    }));

    // 2. Búsqueda por placa o ruta
    const texto = this.busqueda().trim().toLowerCase();
    if (texto) {
      filas = filas.filter((f) => f.placa.toLowerCase().includes(texto) || f.rutaNombre.toLowerCase().includes(texto));
    }

    // 3. Unidades seleccionadas para comparar
    const placas = this.placasSeleccionadas();
    if (placas.length) filas = filas.filter((f) => placas.includes(f.placa));

    // 4. Desempeño
    filas.sort((a, b) => b.ingresos - a.ingresos);
    switch (this.desempeno()) {
      case 'TOP5': filas = filas.slice(0, 5); break;
      case 'BAJO': filas = filas.slice(-3).reverse(); break;
      case 'MAS200': filas = filas.filter((f) => f.viajes > 200); break;
    }
    return filas;
  });

  readonly totalIngresos = computed(() => this.filas().reduce((s, f) => s + f.ingresos, 0));
  readonly totalViajes = computed(() => this.filas().reduce((s, f) => s + f.viajes, 0));

  /** Incidentes del período de las unidades visibles (antes de aplicar categoría y severidad). */
  private readonly incidentesBase = computed(() => {
    const { desde, hasta } = this.rango();
    const ids = new Set(this.filas().map((f) => f.busId));
    return this.incidentes().filter((i) => i.fecha >= desde && i.fecha <= hasta && ids.has(i.busId));
  });

  readonly incidentesFiltrados = computed(() => {
    const cat = this.categoria();
    const sev = this.severidad();
    return this.incidentesBase()
      .filter((i) => (cat === 'TODAS' || i.categoria === cat) && (!sev || i.severidad === sev))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  readonly hayFiltrosActivos = computed(
    () =>
      this.periodo() !== '30D' ||
      !!this.municipio() ||
      this.rutasSeleccionadas().length > 0 ||
      !!this.busqueda() ||
      this.placasSeleccionadas().length > 0 ||
      !!this.desempeno() ||
      this.categoria() !== 'TODAS' ||
      !!this.severidad()
  );

  // ---------- Gráfica ----------
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  constructor() {
    // Se actualiza la gráfica cada vez que cambian las filas filtradas
    afterRenderEffect(() => {
      const filas = this.filas();
      if (!this.chart) this.chart = this.crearGrafica();
      this.chart.data.labels = filas.map((f) => f.placa);
      this.chart.data.datasets[0].data = filas.map((f) => f.ingresos);
      this.chart.update();
    });

    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }

  private crearGrafica(): Chart {
    return new Chart(this.canvas().nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ingresos (GTQ)',
            data: [],
            backgroundColor: COLORES,
            borderColor: '#1E3A8A',
            borderWidth: 1.5,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E3A8A',
            titleColor: '#FFFFFF',
            bodyColor: '#93C5FD',
            padding: 10,
            callbacks: { label: (item) => `Q${this.formatoQ(Number(item.raw))}` },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.8)' },
            ticks: { color: '#64748B', font: { weight: 'bold' as const } },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.8)' },
            ticks: { color: '#64748B', callback: (v) => `Q${v}` },
          },
        },
      },
    });
  }

  // ---------- Acciones ----------

  cambiarMunicipio(valor: string) {
    this.municipio.set(valor);
    // Quita las rutas seleccionadas que ya no pasan por el municipio
    const disponibles = this.rutasDisponibles();
    this.rutasSeleccionadas.update((rutas) => rutas.filter((r) => disponibles.includes(r)));
  }

  alternarRuta(ruta: string) {
    this.rutasSeleccionadas.update((rutas) => (rutas.includes(ruta) ? rutas.filter((r) => r !== ruta) : [...rutas, ruta]));
  }

  alternarPlaca(placa: string) {
    this.placasSeleccionadas.update((p) => (p.includes(placa) ? p.filter((x) => x !== placa) : [...p, placa]));
  }

  alternarDesempeno(id: Exclude<Desempeno, ''>) {
    this.desempeno.update((actual) => (actual === id ? '' : id));
  }

  alternarSeveridad(s: Severidad) {
    this.severidad.update((actual) => (actual === s ? '' : s));
  }

  limpiarFiltros() {
    this.periodo.set('30D');
    this.fechaDesde.set(sumarDias(this.hoy, -29));
    this.fechaHasta.set(this.hoy);
    this.municipio.set('');
    this.rutasSeleccionadas.set([]);
    this.busqueda.set('');
    this.placasSeleccionadas.set([]);
    this.desempeno.set('');
    this.categoria.set('TODAS');
    this.severidad.set('');
  }

  /** Cierra los desplegables (<details>) al hacer clic fuera de ellos. */
  cerrarDesplegables(event: MouseEvent) {
    this.host.nativeElement.querySelectorAll('details[open]').forEach((d: Element) => {
      if (!d.contains(event.target as Node)) d.removeAttribute('open');
    });
  }

  conteoCategoria(cat: CategoriaIncidente | 'TODAS'): number {
    const sev = this.severidad();
    return this.incidentesBase().filter((i) => (cat === 'TODAS' || i.categoria === cat) && (!sev || i.severidad === sev)).length;
  }

  placaDe(busId: string): string {
    return this.buses().find((b) => b.busId === busId)?.placa ?? busId;
  }

  etiquetaCategoria(cat: CategoriaIncidente): string {
    return this.categorias.find((c) => c.id === cat)?.label ?? cat;
  }

  claseSeveridad(s: Severidad): string {
    return {
      ALTA: 'bg-rose-50 text-rose-700 border-rose-200',
      MEDIA: 'bg-amber-50 text-amber-700 border-amber-200',
      BAJA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }[s];
  }

  formatoQ(n: number): string {
    return n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** Exporta a CSV sólo las unidades visibles con los filtros actuales. */
  exportCsv() {
    const { desde, hasta } = this.rango();
    const lineas = [
      `Periodo,${desde} a ${hasta}`,
      'Placa,Ruta,Ingresos (GTQ),Viajes',
      ...this.filas().map((f) => `"${f.placa}","${f.rutaNombre}",${f.ingresos.toFixed(2)},${f.viajes}`),
    ];
    const blob = new Blob(['\uFEFF' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_rutabus_${desde}_a_${hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
