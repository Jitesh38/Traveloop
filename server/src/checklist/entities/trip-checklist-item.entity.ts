import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripChecklistSection } from './trip-checklist-section.entity';

@Entity('trip_checklist_items')
export class TripChecklistItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => TripChecklistSection, (section) => section.items, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: TripChecklistSection;

  @Column({ name: 'section_id' })
  sectionId: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
