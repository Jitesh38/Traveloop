import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  /**
   * Array of image URLs uploaded via the Upload module.
   * PostgreSQL stores this as a native text[] column.
   * Recommended: 2–3 URLs per region.
   *
   * Example: ["http://localhost:3000/uploads/uuid1.jpg", "http://localhost:3000/uploads/uuid2.jpg"]
   */
  @Column('text', { array: true, default: '{}' })
  images: string[];

  /**
   * Average rating (0.0 – 5.0).
   * precision: total digits, scale: decimal places → supports values like 4.75
   */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
