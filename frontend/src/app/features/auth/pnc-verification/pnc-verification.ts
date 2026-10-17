import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../core/services/api';

interface PncResult {
  clean: boolean;
  antecedentes: string[];
}

@Component({
  selector: 'app-pnc-verification',
  standalone: true,
  imports: [],
  templateUrl: './pnc-verification.html',
  styleUrl: './pnc-verification.scss'
})
export class PncVerification implements OnInit {
  private api = inject(Api);
  private router = inject(Router);

  loading = signal(true);
  result = signal<PncResult | null>(null);
  error = signal<string | null>(null);

  ngOnInit() {
    const raw = localStorage.getItem('rutabus_user');
    const user = raw ? JSON.parse(raw) : null;
    const dpi = user?.dpi;

    if (!dpi) {
      this.error.set('No hay DPI para verificar. Regístrate primero.');
      this.loading.set(false);
      return;
    }

    this.verifyPnc(dpi);
  }

  verifyPnc(dpi: string) {
    // MOCK local mientras Fernanda entrega POST /pnc/verify
    setTimeout(() => {
      this.result.set({ clean: true, antecedentes: [] });
      this.loading.set(false);
    }, 2000);

    // Cuando el backend esté listo, reemplaza el setTimeout por:
    // this.api.post<PncResult>('/pnc/verify', { dpi }).subscribe({
    //   next: (res) => { this.result.set(res); this.loading.set(false); },
    //   error: (err) => { this.error.set(err.message); this.loading.set(false); }
    // });
  }

  continuar() {
    if (this.result()?.clean) {
      this.router.navigate(['/pasajero/mapa']);
    } else {
      this.error.set('Tu cuenta requiere revisión manual. Contacta soporte.');
    }
  }
}