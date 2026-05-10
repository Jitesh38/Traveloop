import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { MyTrip } from '../activity/entities/my-trip.entity';
import { TripActivity } from '../activity/entities/trip-activity.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Region } from '../activity/entities/region.entity';
import { Review } from '../review/entities/review.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(MyTrip)
    private readonly tripRepo: Repository<MyTrip>,

    @InjectRepository(TripActivity)
    private readonly tripActivityRepo: Repository<TripActivity>,

    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,

    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  // ─── Overview ──────────────────────────────────────────────────────────────

  async getOverview() {
    const [totalUsers, totalTrips, totalActivities, totalReviews, paidTrips] =
      await Promise.all([
        this.userRepo.count(),
        this.tripRepo.count(),
        this.activityRepo.count(),
        this.reviewRepo.count(),
        this.tripRepo.count({ where: { isPaid: true } }),
      ]);

    // Estimated revenue: sum of (grandTotal) across paid trips
    // grandTotal = sum(activity.pricePerDay * duration) * 1.05
    const revenueResult = await this.tripRepo.manager.query(`
      SELECT COALESCE(SUM(
        (
          SELECT COALESCE(SUM(a.price_per_day), 0)
          FROM trip_activities ta
          JOIN activities a ON a.id = ta.activity_id
          WHERE ta.my_trip_id = t.id
        ) *
        (DATE_PART('day', t.end_date::timestamp - t.start_date::timestamp) + 1) * 1.05
      ), 0) AS estimated_revenue
      FROM my_trips t
      WHERE t.is_paid = true
    `);

    const activeUsers = await this.userRepo.count({ where: { isActive: true } });

    return {
      totalUsers,
      activeUsers,
      totalTrips,
      paidTrips,
      totalActivities,
      totalReviews,
      estimatedRevenue: parseFloat(parseFloat(revenueResult[0].estimated_revenue).toFixed(2)),
    };
  }

  // ─── Trips over time (last 12 months) ─────────────────────────────────────

  async getTripsOverTime() {
    const rows = await this.tripRepo.manager.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COUNT(*)::int                                        AS trips
      FROM my_trips
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);
    return rows;
  }

  // ─── Top regions ───────────────────────────────────────────────────────────

  async getTopRegions(limit = 10) {
    const rows = await this.regionRepo.manager.query(`
      SELECT
        r.id,
        r.name,
        r.rating,
        COUNT(t.id)::int AS trip_count
      FROM regions r
      LEFT JOIN my_trips t ON t.region_id = r.id
      GROUP BY r.id, r.name, r.rating
      ORDER BY trip_count DESC
      LIMIT $1
    `, [limit]);
    return rows;
  }

  // ─── Top activities ────────────────────────────────────────────────────────

  async getTopActivities(limit = 10) {
    const rows = await this.activityRepo.manager.query(`
      SELECT
        a.id,
        a.name,
        a.type,
        a.price_per_day  AS "pricePerDay",
        a.rating,
        r.name           AS region,
        COUNT(ta.id)::int AS booking_count
      FROM activities a
      JOIN regions r ON r.id = a.region_id
      LEFT JOIN trip_activities ta ON ta.activity_id = a.id
      GROUP BY a.id, a.name, a.type, a.price_per_day, a.rating, r.name
      ORDER BY booking_count DESC
      LIMIT $1
    `, [limit]);
    return rows;
  }

  // ─── User engagement ───────────────────────────────────────────────────────

  async getUserEngagement() {
    const [avgStats] = await this.userRepo.manager.query(`
      SELECT
        ROUND(AVG(trip_count),   2)::float AS avg_trips_per_user,
        ROUND(AVG(review_count), 2)::float AS avg_reviews_per_user
      FROM (
        SELECT
          u.id,
          COUNT(DISTINCT t.id) AS trip_count,
          COUNT(DISTINCT rv.id) AS review_count
        FROM users u
        LEFT JOIN my_trips t  ON t.user_id  = u.id
        LEFT JOIN reviews  rv ON rv.user_id = u.id
        GROUP BY u.id
      ) sub
    `);

    const mostActiveUsers = await this.userRepo.manager.query(`
      SELECT
        u.id,
        u.first_name  AS "firstName",
        u.last_name   AS "lastName",
        u.email,
        u.is_active   AS "isActive",
        COUNT(DISTINCT t.id)::int  AS trips,
        COUNT(DISTINCT rv.id)::int AS reviews
      FROM users u
      LEFT JOIN my_trips t  ON t.user_id  = u.id
      LEFT JOIN reviews  rv ON rv.user_id = u.id
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.is_active
      ORDER BY trips DESC
      LIMIT 10
    `);

    return {
      avgTripsPerUser:   avgStats.avg_trips_per_user   ?? 0,
      avgReviewsPerUser: avgStats.avg_reviews_per_user ?? 0,
      mostActiveUsers,
    };
  }

  // ─── User management ───────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? [
          { firstName: ILike(`%${search}%`) },
          { lastName:  ILike(`%${search}%`) },
          { email:     ILike(`%${search}%`) },
        ]
      : {};

    const [users, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'city', 'country', 'role', 'isActive', 'createdAt'],
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'city', 'country', 'pictureUrl', 'role', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const [tripCount, reviewCount, paidTripCount] = await Promise.all([
      this.tripRepo.count({ where: { userId } }),
      this.reviewRepo.count({ where: { userId } }),
      this.tripRepo.count({ where: { userId, isPaid: true } }),
    ]);

    const recentTrips = await this.tripRepo.find({
      where: { userId },
      relations: ['region'],
      order: { createdAt: 'DESC' },
      take: 5,
      select: {
        id: true, name: true, startDate: true, endDate: true, isPaid: true, createdAt: true,
        region: { id: true, name: true },
      },
    });

    return { ...user, stats: { tripCount, paidTripCount, reviewCount }, recentTrips };
  }

  async setUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    user.isActive = isActive;
    await this.userRepo.save(user);
    return {
      id:       user.id,
      isActive: user.isActive,
      message:  isActive ? 'User account enabled' : 'User account disabled',
    };
  }
}
