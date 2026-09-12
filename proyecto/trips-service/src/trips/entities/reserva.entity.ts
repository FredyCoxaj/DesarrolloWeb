import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @Column({ name: 'viaje_id' })
  viaje_id: string;

  @Column({ name: 'numero_asiento' })
  numero_asiento: number;

  @Column({ default: 'confirmada' })
  estado: string;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @Column({ name: 'cancelado_en', type: 'timestamp', nullable: true })
  cancelado_en: Date;
}
