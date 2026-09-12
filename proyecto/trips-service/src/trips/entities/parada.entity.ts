import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('paradas')
export class Parada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ruta_id' })
  ruta_id: string;

  @Column()
  nombre: string;

  @Column()
  orden: number;

  @Column({ name: 'minutos_desde_inicio' })
  minutos_desde_inicio: number;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}
