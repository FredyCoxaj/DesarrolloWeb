import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboard implements AfterViewInit, OnDestroy {
  private admin = inject(AdminService);

  readonly kpis = this.admin.kpis;
  readonly topRoutes = this.admin.topRoutes;
  readonly recentTrips = this.admin.recentTrips;
  readonly revenueData = this.admin.revenueLast7Days;

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.initRevenueChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initRevenueChart() {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.revenueData().map((d) => d.dia);
    const dataValues = this.revenueData().map((d) => d.ingresos);

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos Diarios (GTQ)',
            data: dataValues,
            borderColor: '#1E3A8A', // Azul Institucional
            backgroundColor: 'rgba(30, 58, 138, 0.08)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#1E3A8A',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1E3A8A',
            titleColor: '#FFFFFF',
            bodyColor: '#93C5FD',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (item) => `Q${Number(item.raw).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(226, 232, 240, 0.8)',
            },
            ticks: {
              color: '#64748B',
              font: { size: 11, weight: 'bold' as const },
            },
          },
          y: {
            grid: {
              color: 'rgba(226, 232, 240, 0.8)',
            },
            ticks: {
              color: '#64748B',
              font: { size: 11 },
              callback: (val) => `Q${val}`,
            },
          },
        },
      },
    });
  }
}
