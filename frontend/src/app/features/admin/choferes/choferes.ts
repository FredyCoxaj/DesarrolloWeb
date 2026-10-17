import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminDriver } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-choferes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './choferes.html',
  styleUrl: './choferes.scss',
})
export class AdminChoferes {
  private admin = inject(AdminService);

  readonly drivers = this.admin.drivers;
  readonly buses = this.admin.buses;

  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  formId = '';
  formNombre = '';
  formDpi = '';
  formTelefono = '';
  formLicencia = 'Tipo A';
  formBusAsignado = '';
  formEstado: 'DISPONIBLE' | 'EN_RUTA' | 'DESCANSO' = 'DISPONIBLE';

  openNewModal() {
    this.isEditing.set(false);
    this.formId = '';
    this.formNombre = '';
    this.formDpi = '';
    this.formTelefono = '';
    this.formLicencia = 'Tipo A';
    this.formBusAsignado = '';
    this.formEstado = 'DISPONIBLE';
    this.showModal.set(true);
  }

  openEditModal(driver: AdminDriver) {
    this.isEditing.set(true);
    this.formId = driver.id;
    this.formNombre = driver.nombre;
    this.formDpi = driver.dpi;
    this.formTelefono = driver.telefono;
    this.formLicencia = driver.licencia;
    this.formBusAsignado = driver.busAsignadoPlaca || '';
    this.formEstado = driver.estado;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveDriver() {
    if (!this.formNombre.trim() || !this.formDpi.trim()) {
      alert('Por favor completa nombre y DPI.');
      return;
    }

    if (this.isEditing()) {
      const cur = this.drivers().find((d) => d.id === this.formId);
      this.admin.updateDriver({
        id: this.formId,
        nombre: this.formNombre.trim(),
        dpi: this.formDpi.trim(),
        telefono: this.formTelefono.trim(),
        licencia: this.formLicencia,
        busAsignadoPlaca: this.formBusAsignado || undefined,
        estado: this.formEstado,
        viajesCompletados: cur?.viajesCompletados || 0,
        calificacion: cur?.calificacion || 5.0,
      });
    } else {
      this.admin.addDriver({
        nombre: this.formNombre.trim(),
        dpi: this.formDpi.trim(),
        telefono: this.formTelefono.trim(),
        licencia: this.formLicencia,
        busAsignadoPlaca: this.formBusAsignado || undefined,
        estado: this.formEstado,
      });
    }

    this.closeModal();
  }

  deleteDriver(id: string) {
    if (confirm('¿Deseas desvincular a este chofer del sistema?')) {
      this.admin.deleteDriver(id);
    }
  }
}
