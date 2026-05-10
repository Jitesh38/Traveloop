import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripChecklist } from './trip-checklist.entity';
import { TripChecklistItem } from './trip-checklist-item.entity';

@Entity('trip_checklist_sections')
export class TripChecklistSection {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => TripChecklist, (checklist) => checklist.sections, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checklist_id' })
  checklist: TripChecklist;

  @Column({ name: 'checklist_id' })
  checklistId: number;

  @Column({ type: 'varchar' })
  title: string;

  @OneToMany(() => TripChecklistItem, (item) => item.section, {
    cascade: true,
    eager: false,
  })
  items: TripChecklistItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
