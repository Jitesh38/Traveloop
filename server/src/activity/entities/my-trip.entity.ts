import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Region } from './region.entity';
import { TripActivity } from './trip-activity.entity';
import { User } from '../../users/entities/user.entity';

/**
 * MyTrip — a user's planned trip to a region, containing multiple TripActivities.
 *
 * Relationships:
 *   ManyToOne  → Region        (one region per trip)
 *   OneToMany  → TripActivity  (one trip has many activity slots)
 *
 * Name auto-generation:
 *   If name is not supplied at insert time, it is generated as:
 *   "{regionId} · {startDate} – {endDate}"
 *   The service layer can override this with the actual region name
 *   after the region relation is resolved.
 */
@Entity('my_trips')
export class MyTrip {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // ─── Owner (join to users table) ───────────────────────────────────────────

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // ─── Name (auto-generated if blank) ────────────────────────────────────────

  @Column({ nullable: true })
  name: string;

  // ─── Region Join ───────────────────────────────────────────────────────────

  @ManyToOne(() => Region, { eager: false, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'region_id' })
  regionId: number;

  // ─── Date Range ────────────────────────────────────────────────────────────

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  // ─── Budget & Notes ────────────────────────────────────────────────────────

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ─── Invoice ───────────────────────────────────────────────────────────────

  @Column({ name: 'is_paid', type: 'boolean', default: false })
  isPaid: boolean;

  // ─── Trip Activities (OneToMany) ────────────────────────────────────────────

  /**
   * One trip has many activity slots.
   * Use { cascade: true } so saving a MyTrip can also persist its TripActivities.
   * Load with relations: ['tripActivities'] in queries — not eager to avoid bloat.
   */
  @OneToMany(() => TripActivity, (ta) => ta.myTrip, {
    cascade: true,
    eager: false,
  })
  tripActivities: TripActivity[];

  // ─── Timestamps ────────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ─── Hooks ─────────────────────────────────────────────────────────────────

  @BeforeInsert()
  autoGenerateName() {
    if (!this.name || this.name.trim() === '') {
      // Format: "Region-{regionId} · {startDate} – {endDate}"
      // Service layer can re-save with actual region name once relation is loaded.
      this.name = `Region-${this.regionId} · ${this.startDate} – ${this.endDate}`;
    }
  }
}
