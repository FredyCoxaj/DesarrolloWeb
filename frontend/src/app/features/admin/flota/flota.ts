import { Component, inject, signal } from '@angular/core';
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
export class AdminFlota {
  private admin = inject(AdminService);

  readonly buses = this.admin.buses;

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
    this.formModelo = bus.modelo;
    this.formAnio = bus.anio;
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

    if (this.isEditing()) {
      this.admin.updateBus({
        id: this.formId,
        placa: this.formPlaca.toUpperCase().trim(),
        modelo: this.formModelo.trim(),
        anio: Number(this.formAnio),
        capacidad: Number(this.formCapacidad),
        estado: this.formEstado,
      });
    } else {
      this.admin.addBus({
        placa: this.formPlaca.toUpperCase().trim(),
        modelo: this.formModelo.trim(),
        anio: Number(this.formAnio),
        capacidad: Number(this.formCapacidad),
        estado: this.formEstado,
      });
    }

    this.closeModal();
  }

  deleteBus(id: string) {
    if (confirm('¿Deseas dar de baja esta unidad de la flota?')) {
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
