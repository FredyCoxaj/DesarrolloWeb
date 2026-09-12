import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('viajes')
export class Viaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ruta_id' })
  ruta_id: string;

  @Column({ name: 'bus_id' })
  bus_id: string;

  @Column({ name: 'conductor_id' })
  conductor_id: string;

  @Column({ name: 'fecha_hora_salida', type: 'timestamp' })
  fecha_hora_salida: Date;

  @Column({ default: 'programado' })
  estado: string;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}
