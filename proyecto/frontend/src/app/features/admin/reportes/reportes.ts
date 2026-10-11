import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class AdminReportes implements AfterViewInit, OnDestroy {
  private admin = inject(AdminService);

  readonly summaries = this.admin.busRevenueSummaries;
  readonly cancellations = this.admin.cancellationsSummary;

  private barChart: Chart | null = null;

  ngAfterViewInit() {
    this.initBarChart();
  }

  ngOnDestroy() {
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  private initBarChart() {
    const canvas = document.getElementById('busRevenueBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.summaries().map((s) => s.placa);
    const dataMes = this.summaries().map((s) => s.ingresosMes);

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos Mensuales (GTQ)',
            data: dataMes,
            backgroundColor: [
              '#1E3A8A', // Azul Institucional Principal
              '#2563EB',
              '#3B82F6',
              '#60A5FA',
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
            padding: 10,
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

  exportCsv() {
    this.admin.exportReportCsv();
  }
}
