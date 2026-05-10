import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MyTrip } from '../../activity/entities/my-trip.entity';
import { TripChecklistSection } from './trip-checklist-section.entity';

/**
 * TripChecklist — one checklist per trip.
 * Auto-created (get-or-create) on first GET /checklist?trip_id=.
 *
 * Trip (1) ──── (1) TripChecklist ──── (many) TripChecklistSection ──── (many) TripChecklistItem
 */
@Entity('trip_checklists')
export class TripChecklist {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => MyTrip, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'my_trip_id' })
  myTrip: MyTrip;

  @Column({ name: 'my_trip_id', unique: true })
  myTripId: number;

  @OneToMany(() => TripChecklistSection, (section) => section.checklist, {
    cascade: true,
    eager: false,
  })
  sections: TripChecklistSection[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
