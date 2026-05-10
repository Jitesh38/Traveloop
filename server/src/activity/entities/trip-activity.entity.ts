import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Activity } from './activity.entity';
import { MyTrip } from './my-trip.entity';

/**
 * TripActivity — a single planned activity slot inside a MyTrip.
 *
 * Relationships:
 *   ManyToOne → Activity  (which activity is being done)
 *   ManyToOne → MyTrip    (which trip it belongs to — inverse of MyTrip.tripActivities)
 *
 * totalHours is auto-calculated from endDateTime - startDateTime
 * on every insert and update via the @BeforeInsert / @BeforeUpdate hook.
 */
@Entity('trip_activities')
export class TripActivity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // ─── Activity Join ─────────────────────────────────────────────────────────

  @ManyToOne(() => Activity, { eager: false, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ name: 'activity_id' })
  activityId: number;

  // ─── MyTrip Join (inverse side of OneToMany) ───────────────────────────────

  @ManyToOne(() => MyTrip, (myTrip) => myTrip.tripActivities, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'my_trip_id' })
  myTrip: MyTrip;

  @Column({ name: 'my_trip_id', nullable: true })
  myTripId: number;

  // ─── Scheduling ────────────────────────────────────────────────────────────

  @Column({ name: 'start_date_time', type: 'timestamp with time zone', nullable: true })
  startDateTime: Date | null;

  @Column({ name: 'end_date_time', type: 'timestamp with time zone', nullable: true })
  endDateTime: Date | null;

  /**
   * Auto-calculated on save: (endDateTime - startDateTime) in hours.
   * Stored as decimal so partial hours (e.g. 1.5h) are preserved.
   */
  @Column({ name: 'total_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalHours: number;

  // ─── Details ───────────────────────────────────────────────────────────────

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ─── Timestamps ────────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ─── Hooks ─────────────────────────────────────────────────────────────────

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalHours() {
    if (this.startDateTime && this.endDateTime) {
      const diffMs =
        new Date(this.endDateTime).getTime() - new Date(this.startDateTime).getTime();
      // Convert ms → hours, round to 2 decimal places
      this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }
  }
}
