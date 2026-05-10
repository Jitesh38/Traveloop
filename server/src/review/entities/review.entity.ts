import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Region } from '../../activity/entities/region.entity';
import { Activity } from '../../activity/entities/activity.entity';

/**
 * Review — a user's review of a region or an activity (or both).
 *
 * Constraints:
 *   • At least one of regionId / activityId must be set (enforced in service).
 *   • rating must be between 1 and 5 (DB CHECK constraint).
 *   • Only the owner can PATCH or DELETE (enforced in service via userId).
 */
@Entity('reviews')
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // ─── Owner ─────────────────────────────────────────────────────────────────

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // ─── Region (optional) ─────────────────────────────────────────────────────

  @ManyToOne(() => Region, { eager: false, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ name: 'region_id', nullable: true })
  regionId: number;

  // ─── Activity (optional) ───────────────────────────────────────────────────

  @ManyToOne(() => Activity, { eager: false, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ name: 'activity_id', nullable: true })
  activityId: number;

  // ─── Review Content ────────────────────────────────────────────────────────

  /** Star rating 1–5, enforced via DB CHECK constraint. */
  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  experience: string;

  // ─── Timestamps ────────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
