import { Component, inject, signal, computed, effect, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BusRevenueSummary, CancellationRecord } from '../../../core/services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface FilteredBusRow {
  busId: string;
  placa: string;
  rutaNombre: string;
  municipios: string[];
  municipiosTexto: string;
  ingresosPeriodo: number;
  viajesPeriodo: number;
  promedioPorViaje: number;
}

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class AdminReportes implements AfterViewInit, OnDestroy {
  private admin = inject(AdminService);

  readonly summaries = this.admin.busRevenueSummaries;
  readonly allCancellationRecords = this.admin.cancellationRecords;

  // ========================================================
  // 1. FILTROS GLOBALES (Barra de Control Superior)
  // ========================================================
  selectedPeriod = signal<string>('ULTIMOS_30_DIAS');
  customStartDate = signal<string>('2026-10-01');
  customEndDate = signal<string>('2026-10-22');

  selectedMunicipality = signal<string>('TODOS');
  selectedMainRoute = signal<string>('TODAS');

  // ========================================================
  // 2. FILTROS DE TABLA Y SELECCIÓN DE FLOTA
  // ========================================================
  searchTerm = signal<string>('');
  selectedPlacas = signal<string[]>([]);
  selectedPerformance = signal<string>('TODOS');

  // ========================================================
  // 3. FILTROS DE CANCELACIONES E INCIDENCIAS
  // ========================================================
  selectedIncidentCategory = signal<string>('TODAS');
  selectedIncidentSeverity = signal<string>('TODAS');

  // Lista fija de municipios operativos para el selector
  readonly availableMunicipalities = [
    { id: 'TODOS', nombre: 'Todos los Municipios' },
    { id: 'Amatitlán', nombre: 'Amatitlán' },
    { id: 'Villa Nueva', nombre: 'Villa Nueva' },
    { id: 'Petapa', nombre: 'San Miguel Petapa' },
    { id: 'Mixco', nombre: 'Mixco' },
    { id: 'Zona 12', nombre: 'Zona 12 (Capital)' },
  ];

  // Lista fija de rutas principales para el selector
  readonly availableRoutes = [
    { id: 'TODAS', nombre: 'Todas las Rutas' },
    { id: 'Amatitlán → Villa Nueva', nombre: 'Amatitlán → Villa Nueva' },
    { id: 'Villa Nueva → Zona 12', nombre: 'Villa Nueva → Zona 12' },
    { id: 'Amatitlán → Mixco', nombre: 'Amatitlán → Mixco' },
    { id: 'Amatitlán → Petapa', nombre: 'Amatitlán → Petapa' },
  ];

  // Placas disponibles para el multiselector de comparación
  readonly availablePlacas = computed(() => {
    return this.summaries().map((b) => b.placa);
  });

  // Etiqueta legible del período activo
  readonly periodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'HOY':
        return 'Hoy (22 Octubre)';
      case 'AYER':
        return 'Ayer (21 Octubre)';
      case 'ULTIMOS_7_DIAS':
        return 'Últimos 7 días';
      case 'ULTIMOS_30_DIAS':
        return 'Últimos 30 días';
      case 'ESTE_MES':
        return 'Este Mes (Octubre 2026)';
      case 'ANIO_A_LA_FECHA':
        return 'Año a la fecha (2026)';
      case 'PERSONALIZADO':
        return `Personalizado (${this.customStartDate()} al ${this.customEndDate()})`;
      default:
        return 'Últimos 30 días';
    }
  });

  // Conteo de filtros activos para indicador visual
  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedPeriod() !== 'ULTIMOS_30_DIAS') count++;
    if (this.selectedMunicipality() !== 'TODOS') count++;
    if (this.selectedMainRoute() !== 'TODAS') count++;
    if (this.searchTerm().trim().length > 0) count++;
    if (this.selectedPlacas().length > 0) count++;
    if (this.selectedPerformance() !== 'TODOS') count++;
    if (this.selectedIncidentCategory() !== 'TODAS') count++;
    if (this.selectedIncidentSeverity() !== 'TODAS') count++;
    return count;
  });

  // ========================================================
  // FILTRADO REACTIVO DE UNIDADES Y RENDIMIENTO
  // ========================================================
  readonly filteredSummaries = computed<FilteredBusRow[]>(() => {
    const period = this.selectedPeriod();
    const muni = this.selectedMunicipality();
    const route = this.selectedMainRoute();
    const search = this.searchTerm().toLowerCase().trim();
    const placas = this.selectedPlacas();
    const perf = this.selectedPerformance();

    // 1. Mapeo a las métricas del período seleccionado
    let rows: FilteredBusRow[] = this.summaries().map((b) => {
      let ingresos = b.ingresosMes;
      let viajes = b.viajesMes;

      if (period === 'HOY') {
        ingresos = b.ingresosHoy;
        viajes = b.viajesHoy;
      } else if (period === 'AYER') {
        ingresos = b.ingresosAyer;
        viajes = Math.max(1, Math.round(b.viajesHoy * 0.95));
      } else if (period === 'ULTIMOS_7_DIAS') {
        ingresos = b.ingresosSemana;
        viajes = b.viajesSemana;
      } else if (period === 'ANIO_A_LA_FECHA') {
        ingresos = b.ingresosAnio;
        viajes = b.viajesAnio;
      } else if (period === 'PERSONALIZADO') {
        const start = new Date(this.customStartDate());
        const end = new Date(this.customEndDate());
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
        const ratio = diffDays / 30;
        ingresos = Math.round(b.ingresosMes * ratio * 100) / 100;
        viajes = Math.max(1, Math.round(b.viajesMes * ratio));
      }

      return {
        busId: b.busId,
        placa: b.placa,
        rutaNombre: b.rutaNombre,
        municipios: b.municipios || [],
        municipiosTexto: (b.municipios || []).join(' - '),
        ingresosPeriodo: ingresos,
        viajesPeriodo: viajes,
        promedioPorViaje: viajes > 0 ? Math.round((ingresos / viajes) * 100) / 100 : 0,
      };
    });

    // 2. Filtro por Municipio
    if (muni !== 'TODOS') {
      rows = rows.filter((r) => r.municipios.some((m) => m.toLowerCase().includes(muni.toLowerCase())));
    }

    // 3. Filtro por Ruta Principal
    if (route !== 'TODAS') {
      rows = rows.filter((r) => r.rutaNombre.toLowerCase().includes(route.toLowerCase()));
    }

    // 4. Búsqueda instantánea por Placa o Ruta
    if (search.length > 0) {
      rows = rows.filter((r) => r.placa.toLowerCase().includes(search) || r.rutaNombre.toLowerCase().includes(search));
    }

    // 5. Selector Multiselección de Unidades (Aislamiento de flota)
    if (placas.length > 0) {
      rows = rows.filter((r) => placas.includes(r.placa));
    }

    // 6. Filtro por Desempeño / Rendimiento
    if (perf === 'TOP_5_INGRESOS') {
      rows = [...rows].sort((a, b) => b.ingresosPeriodo - a.ingresosPeriodo).slice(0, 5);
    } else if (perf === 'MENOR_RENDIMIENTO') {
      rows = [...rows].sort((a, b) => a.ingresosPeriodo - b.ingresosPeriodo);
    } else if (perf === 'MAS_200_VIAJES') {
      rows = rows.filter((r) => r.viajesPeriodo >= 200);
    }

    return rows;
  });

  // Totales agregados dinámicos para KPIs superiores
  readonly totalRevenueFiltered = computed(() => {
    return this.filteredSummaries().reduce((acc, row) => acc + row.ingresosPeriodo, 0);
  });

  readonly totalTripsFiltered = computed(() => {
    return this.filteredSummaries().reduce((acc, row) => acc + row.viajesPeriodo, 0);
  });

  readonly avgTicketFiltered = computed(() => {
    const trips = this.totalTripsFiltered();
    return trips > 0 ? this.totalRevenueFiltered() / trips : 0;
  });

  // ========================================================
  // FILTRADO REACTIVO DE CANCELACIONES E INCIDENCIAS
  // ========================================================
  readonly filteredCancellations = computed<CancellationRecord[]>(() => {
    const cat = this.selectedIncidentCategory();
    const sev = this.selectedIncidentSeverity();
    const muni = this.selectedMunicipality();
    const route = this.selectedMainRoute();
    const placas = this.selectedPlacas();

    return this.allCancellationRecords().filter((rec) => {
      if (cat !== 'TODAS' && rec.categoria !== cat) return false;
      if (sev !== 'TODAS' && rec.severidad !== sev) return false;
      if (muni !== 'TODOS' && !rec.municipio.toLowerCase().includes(muni.toLowerCase())) return false;
      if (route !== 'TODAS' && !rec.rutaNombre.toLowerCase().includes(route.toLowerCase())) return false;
      if (placas.length > 0 && !placas.includes(rec.busPlaca)) return false;
      return true;
    });
  });

  // Resumen porcentual calculado dinámicamente según filtros de incidencias
  readonly dynamicCancellationsSummary = computed(() => {
    const list = this.filteredCancellations();
    const total = list.length;
    if (total === 0) return [];

    const categoriesMap: Record<string, { label: string; count: number }> = {
      OPERATIVOS: { label: 'Problemas Operativos (Tráfico)', count: 0 },
      MECANICAS: { label: 'Fallas Mecánicas', count: 0 },
      USUARIO: { label: 'Factores del Usuario', count: 0 },
      CLIMA_BLOQUEO: { label: 'Clima / Bloqueos', count: 0 },
    };

    list.forEach((item) => {
      if (categoriesMap[item.categoria]) {
        categoriesMap[item.categoria].count++;
      }
    });

    return Object.values(categoriesMap)
      .filter((c) => c.count > 0)
      .map((c) => ({
        motivo: c.label,
        cantidad: c.count,
        porcentaje: Math.round((c.count / total) * 100),
      }));
  });

  private barChart: Chart | null = null;

  constructor() {
    // Actualizar Chart.js en tiempo real al reaccionar a cualquier cambio de filtros
    effect(() => {
      const data = this.filteredSummaries();
      const label = this.periodLabel();
      this.updateBarChart(data, label);
    });
  }

  ngAfterViewInit() {
    this.initBarChart();
  }

  ngOnDestroy() {
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  // ========================================================
  // GRÁFICA CHART.JS REACTIVA
  // ========================================================
  private initBarChart() {
    const canvas = document.getElementById('busRevenueBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    const data = this.filteredSummaries();
    const labels = data.map((s) => s.placa);
    const dataset = data.map((s) => s.ingresosPeriodo);

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: `Ingresos (${this.periodLabel()})`,
            data: dataset,
            backgroundColor: [
              '#1E3A8A', // Azul Institucional
              '#2563EB',
              '#059669', // Esmeralda Finanzas
              '#D97706', // Ámbar
              '#7C3AED', // Violeta
              '#0284C7',
            ],
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
            padding: 12,
            callbacks: {
              label: (item) => `Q${Number(item.raw).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.8)' },
            ticks: { color: '#64748B', font: { weight: 'bold' as const } },
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.8)' },
            ticks: {
              color: '#64748B',
              callback: (v) => `Q${v}`,
            },
          },
        },
      },
    });
  }

  private updateBarChart(data: FilteredBusRow[], period: string) {
    if (!this.barChart) return;

    this.barChart.data.labels = data.map((d) => d.placa);
    this.barChart.data.datasets[0].data = data.map((d) => d.ingresosPeriodo);
    this.barChart.data.datasets[0].label = `Ingresos (${period})`;
    this.barChart.update();
  }

  // ========================================================
  // ACCIONES DE INTERACCIÓN & BUENAS PRÁCTICAS
  // ========================================================

  /**
   * Alterna la selección de una placa para comparar unidades
   */
  togglePlaca(placa: string) {
    const list = this.selectedPlacas();
    if (list.includes(placa)) {
      this.selectedPlacas.set(list.filter((p) => p !== placa));
    } else {
      this.selectedPlacas.set([...list, placa]);
    }
  }

  isPlacaSelected(placa: string): boolean {
    return this.selectedPlacas().includes(placa);
  }

  clearPlacaSelection() {
    this.selectedPlacas.set([]);
  }

  /**
   * Botón "Limpiar Filtros" (Reset All): Restablece todos los parámetros
   */
  resetAllFilters() {
    this.selectedPeriod.set('ULTIMOS_30_DIAS');
    this.customStartDate.set('2026-10-01');
    this.customEndDate.set('2026-10-22');
    this.selectedMunicipality.set('TODOS');
    this.selectedMainRoute.set('TODAS');
    this.searchTerm.set('');
    this.selectedPlacas.set([]);
    this.selectedPerformance.set('TODOS');
    this.selectedIncidentCategory.set('TODAS');
    this.selectedIncidentSeverity.set('TODAS');
  }

  /**
   * Exportación Dinámica: Descarga CSV únicamente con los datos actualmente filtrados
   */
  exportCsv() {
    const data = this.filteredSummaries();
    this.admin.exportReportCsv(data, this.periodLabel());
  }
}
