import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rutas')
export class Ruta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  origen: string;

  @Column()
  destino: string;

  @Column({ name: 'duracion_estimada_min' })
  duracion_estimada_min: number;

  @Column({ default: 'activo' })
  estado: string;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}
