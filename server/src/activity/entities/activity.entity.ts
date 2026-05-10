import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from './region.entity';

export enum ActivityType {
  ADVENTURE   = 'adventure',
  CULTURAL    = 'cultural',
  RELAXATION  = 'relaxation',
  SPORTS      = 'sports',
  FOOD        = 'food',
  SIGHTSEEING = 'sightseeing',
  OTHER       = 'other',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true, name:'tag_line' })
  tagLine: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Region, { eager: false, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'region_id' })
  regionId: number;

  /**
   * Array of image URLs uploaded via the Upload module.
   * PostgreSQL native text[] column.
   */
  @Column('text', { array: true, default: '{}' })
  images: string[];

  /**
   * Activity category — stored as a varchar enum in PostgreSQL.
   */
  @Column({ type: 'enum', enum: ActivityType, default: ActivityType.OTHER })
  type: ActivityType;

  /**
   * Price per day in the local currency (e.g. INR, USD).
   * Used for invoice line-item calculation: price × tripDurationDays.
   */
  @Column({ name: 'price_per_day', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePerDay: number;

  /**
   * Average rating (0.00 – 5.00).
   */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
