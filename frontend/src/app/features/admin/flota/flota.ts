import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Bus } from '../../../core/models';

@Component({
  selector: 'app-admin-flota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flota.html',
  styleUrl: './flota.scss',
})
export class AdminFlota implements OnInit {
  private admin = inject(AdminService);

  readonly buses = this.admin.buses;
  readonly loading = this.admin.loadingBuses;

  // Filtros reactivos
  searchQuery = signal<string>('');
  estadoFilter = signal<string>('TODOS');

  readonly filteredBuses = computed(() => {
    let list = this.buses();
    const query = this.searchQuery().toLowerCase().trim();
    const estado = this.estadoFilter();

    if (estado !== 'TODOS') {
      list = list.filter((b) => b.estado === estado);
    }

    if (query) {
      list = list.filter(
        (b) =>
          b.placa.toLowerCase().includes(query) ||
          (b.modelo && b.modelo.toLowerCase().includes(query)) ||
          (b.marca && b.marca.toLowerCase().includes(query))
      );
    }

    return list;
  });

  ngOnInit() {
    this.admin.loadBuses();
  }

  refresh() {
    this.admin.loadBuses();
  }

  // Modal Crear / Editar
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  // Form Model
  formId = '';
  formPlaca = '';
  formModelo = '';
  formAnio = 2023;
  formCapacidad = 40;
  formEstado: 'ACTIVO' | 'MANTENIMIENTO' | 'FUERA_SERVICIO' = 'ACTIVO';

  // Bus seleccionado para previsualizar mapa de asientos 2+2
  selectedBusForSeats = signal<Bus | null>(null);

  openNewBusModal() {
    this.isEditing.set(false);
    this.formId = '';
    this.formPlaca = '';
    this.formModelo = '';
    this.formAnio = new Date().getFullYear();
    this.formCapacidad = 40;
    this.formEstado = 'ACTIVO';
    this.showModal.set(true);
  }

  openEditBusModal(bus: Bus) {
    this.isEditing.set(true);
    this.formId = bus.id;
    this.formPlaca = bus.placa;
    this.formModelo = bus.modelo ?? '';
    this.formAnio = bus.anio && bus.anio >= 1990 ? bus.anio : 2022;
    this.formCapacidad = bus.capacidad;
    this.formEstado = bus.estado;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveBus() {
    if (!this.formPlaca.trim() || !this.formModelo.trim()) {
      alert('Por favor completa la placa y el modelo del bus.');
      return;
    }

    const anioValido = Number(this.formAnio) >= 1990 ? Number(this.formAnio) : 2022;
    const capacidadValida = Number(this.formCapacidad) > 0 ? Number(this.formCapacidad) : 40;

    if (this.isEditing()) {
      this.admin.updateBus({
        id: this.formId,
        placa: this.formPlaca.toUpperCase().trim(),
        modelo: this.formModelo.trim(),
        anio: anioValido,
        capacidad: capacidadValida,
        estado: this.formEstado,
      });
    } else {
      this.admin.addBus({
        placa: this.formPlaca.toUpperCase().trim(),
        modelo: this.formModelo.trim(),
        anio: anioValido,
        capacidad: capacidadValida,
        estado: this.formEstado,
      });
    }

    this.closeModal();
  }

  deleteBus(id: string) {
    if (confirm('¿Deseas dar de baja esta unidad de la flota en la base de datos?')) {
      this.admin.deleteBus(id);
    }
  }

  viewSeats(bus: Bus) {
    this.selectedBusForSeats.set(bus);
  }

  closeSeatsModal() {
    this.selectedBusForSeats.set(null);
  }

  getSeatRows(capacidad: number): number[] {
    const totalRows = Math.ceil(capacidad / 4);
    return Array.from({ length: totalRows }, (_, i) => i);
  }
}
