import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CreateMyTripDto } from './dto/create-my-trip.dto';
import { UpdateTripActivityDto } from './dto/update-trip-activity.dto';
import { Activity } from './entities/activity.entity';
import { TripActivity } from './entities/trip-activity.entity';
import { MyTrip } from './entities/my-trip.entity';
import { Region } from './entities/region.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,

    @InjectRepository(TripActivity)
    private readonly tripActivityRepo: Repository<TripActivity>,

    @InjectRepository(MyTrip)
    private readonly myTripRepo: Repository<MyTrip>,

    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  async getMyTrips(
    userId: string,
    timeline?: 'ongoing' | 'previous' | 'planned',
  ): Promise<{
    ongoing: MyTrip[];
    previous: MyTrip[];
    planned: MyTrip[];
  } | MyTrip[]> {
    const trips = await this.myTripRepo.find({
      where: { userId },
      relations: ['region', 'tripActivities', 'tripActivities.activity'],
      order: { startDate: 'ASC' },
    });

    // Compare dates as strings (YYYY-MM-DD) — avoids timezone shifting
    const today = new Date().toISOString().split('T')[0];

    const categorise = (trips: MyTrip[]) => ({
      ongoing:  trips.filter((t) => t.startDate <= today && t.endDate >= today),
      previous: trips.filter((t) => t.endDate < today),
      planned:  trips.filter((t) => t.startDate > today),
    });

    const categorised = categorise(trips);

    // If a timeline filter is provided, return only that bucket as a flat array
    if (timeline) {
      return categorised[timeline];
    }

    return categorised;
  }

  getAllRegions(): Promise<Region[]> {
    return this.regionRepo.find({ order: { name: 'ASC' } });
  }

  async createMyTrip(dto: CreateMyTripDto, userId: string): Promise<MyTrip> {
    const { name, startDate, endDate, activityIds } = dto;

    // 1. Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('End date must be on or after start date');
    }

    // 2. Load all activities to validate they exist and resolve regionId
    //    Use the first activity's region as the trip region (all activities
    //    should ideally belong to the same region — enforce this if needed)
    const activities = await this.activityRepo.findByIds(activityIds);

    const foundIds = activities.map((a) => a.id);
    const missingIds = activityIds.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(`Activities not found: ${missingIds.join(', ')}`);
    }

    const regionId = activities[0].regionId;

    // 3. Create one TripActivity per activityId
    //    startDateTime / endDateTime are left null — user will fill them later
    const tripActivities = this.tripActivityRepo.create(
      activityIds.map((activityId) => ({ activityId })),
    );
    const savedTripActivities = await this.tripActivityRepo.save(tripActivities);

    // 4. Create MyTrip and link all saved TripActivities
    const myTrip = this.myTripRepo.create({
      name,
      userId,
      regionId,
      startDate,
      endDate,
      tripActivities: savedTripActivities,
    });

    return this.myTripRepo.save(myTrip);
  }

  async getTripActivities(tripId: number, userId: string): Promise<TripActivity[]> {
    // 1. Load the trip with its user relation to validate ownership
    const trip = await this.myTripRepo.findOne({
      where: { id: tripId },
      relations: ['user'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with id ${tripId} not found`);
    }

    // 2. Ownership check — compare trip.userId against JWT sub
    if (trip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this trip');
    }

    // 3. Return all trip activities with their activity details
    return this.tripActivityRepo.find({
      where: { myTripId: tripId },
      relations: ['activity'],
      order: { id: 'ASC' },
    });
  }

  async updateTripActivity(
    tripActivityId: number,
    dto: UpdateTripActivityDto,
    userId: string,
  ): Promise<TripActivity> {
    // 1. Load the trip activity with its parent trip
    const tripActivity = await this.tripActivityRepo.findOne({
      where: { id: tripActivityId },
      relations: ['myTrip'],
    });

    if (!tripActivity) {
      throw new NotFoundException(`Trip activity with id ${tripActivityId} not found`);
    }

    if (!tripActivity.myTrip) {
      throw new NotFoundException(`Trip activity ${tripActivityId} is not linked to any trip`);
    }

    // 2. Ownership check — validate via the parent trip's userId
    if (tripActivity.myTrip.userId !== userId) {
      throw new ForbiddenException('You do not have access to this trip activity');
    }

    // 3. Validate that endDateTime is after startDateTime when both are provided
    const newStart = dto.startDateTime
      ? new Date(dto.startDateTime)
      : tripActivity.startDateTime;
    const newEnd = dto.endDateTime
      ? new Date(dto.endDateTime)
      : tripActivity.endDateTime;

    if (newStart && newEnd && newEnd <= newStart) {
      throw new BadRequestException('endDateTime must be after startDateTime');
    }

    // 4. Apply updates — only patch fields that were provided
    if (dto.startDateTime !== undefined) tripActivity.startDateTime = new Date(dto.startDateTime);
    if (dto.endDateTime !== undefined)   tripActivity.endDateTime   = new Date(dto.endDateTime);
    if (dto.budget !== undefined)        tripActivity.budget        = parseFloat(dto.budget);
    if (dto.description !== undefined)   tripActivity.description   = dto.description;

    // totalHours is recalculated automatically by @BeforeUpdate hook
    return this.tripActivityRepo.save(tripActivity);
  }


  findAll(regionId?: number, search?: string): Promise<Activity[]> {
    // Build WHERE conditions — search runs across name, tagLine, and description
    // ILike is case-insensitive and works natively with PostgreSQL
    const baseCondition = regionId ? { regionId } : {};
    const searchPattern = search ? `%${search}%` : undefined;

    const where = searchPattern
      ? [
          { ...baseCondition, name: ILike(searchPattern) },
          { ...baseCondition, tagLine: ILike(searchPattern) },
          { ...baseCondition, description: ILike(searchPattern) },
        ]
      : baseCondition;

    return this.activityRepo.find({
      where,
      relations: ['region'],
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} activity`;
  }

  update(id: number, updateActivityDto: UpdateActivityDto) {
    return `This action updates a #${id} activity`;
  }

  remove(id: number) {
    return `This action removes a #${id} activity`;
  }
}
