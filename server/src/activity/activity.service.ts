import { BadRequestException, ForbiddenException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import PDFDocument = require('pdfkit');
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
import { User } from '../users/entities/user.entity';

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

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    const { name, regionName, startDate, endDate, activityIds } = dto;

    // 1. Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('End date must be on or after start date');
    }

    // 2. Resolve region by name (case-insensitive)
    const region = await this.regionRepo.findOne({
      where: { name: ILike(regionName) },
    });
    if (!region) {
      throw new NotFoundException(`Region "${regionName}" not found`);
    }

    // 3. Validate all activity IDs exist
    const activities = await this.activityRepo.findByIds(activityIds);
    const foundIds = activities.map((a) => a.id);
    const missingIds = activityIds.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(`Activities not found: ${missingIds.join(', ')}`);
    }

    // 4. Create one TripActivity per activityId
    //    startDateTime / endDateTime are left null — user will fill them later
    const tripActivities = this.tripActivityRepo.create(
      activityIds.map((activityId) => ({ activityId })),
    );
    const savedTripActivities = await this.tripActivityRepo.save(tripActivities);

    // 5. Create MyTrip with the resolved regionId
    const myTrip = this.myTripRepo.create({
      name,
      userId,
      regionId: region.id,
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


  async getInvoice(tripId: number, userId: string) {
    // 1. Load trip with region
    const trip = await this.myTripRepo.findOne({
      where: { id: tripId },
      relations: ['region'],
    });
    if (!trip) throw new NotFoundException(`Trip with id ${tripId} not found`);
    if (trip.userId !== userId)
      throw new ForbiddenException('You do not have access to this trip');

    // 2. Load customer
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    // 3. Trip duration (inclusive: Jun 1 → Jun 5 = 5 days)
    const start = new Date(trip.startDate);
    const end   = new Date(trip.endDate);
    const durationDays =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 4. Load trip activities with activity details
    const tripActivities = await this.tripActivityRepo.find({
      where: { myTripId: tripId },
      relations: ['activity'],
      order: { id: 'ASC' },
    });

    // 5. Build line items
    const TAX_RATE = 0.05;

    const lineItems = tripActivities.map((ta) => {
      const pricePerDay = parseFloat(ta.activity.pricePerDay as any) || 0;
      const lineTotal   = parseFloat((pricePerDay * durationDays).toFixed(2));
      return {
        activityId:   ta.activity.id,
        name:         ta.activity.name,
        type:         ta.activity.type,
        pricePerDay,
        durationDays,
        lineTotal,
      };
    });

    // 6. Summary
    const subtotal   = parseFloat(lineItems.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2));
    const taxAmount  = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const grandTotal = parseFloat((subtotal + taxAmount).toFixed(2));

    return {
      tripId:      trip.id,
      tripName:    trip.name,
      region:      trip.region.name,
      startDate:   trip.startDate,
      endDate:     trip.endDate,
      durationDays,
      isPaid:      trip.isPaid,
      generatedAt: new Date().toISOString(),
      customer: {
        name:  `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      lineItems,
      summary: {
        subtotal,
        taxRate:    TAX_RATE * 100,   // percentage: 5
        taxAmount,
        grandTotal,
      },
    };
  }

  async markAsPaid(tripId: number, isPaid: boolean, userId: string): Promise<{ isPaid: boolean; message: string }> {
    const trip = await this.myTripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException(`Trip with id ${tripId} not found`);
    if (trip.userId !== userId)
      throw new ForbiddenException('You do not have access to this trip');

    trip.isPaid = isPaid;
    await this.myTripRepo.save(trip);
    return {
      isPaid: trip.isPaid,
      message: isPaid ? 'Invoice marked as paid' : 'Invoice marked as unpaid',
    };
  }

  async downloadInvoice(tripId: number, userId: string): Promise<StreamableFile> {
    const invoice = await this.getInvoice(tripId, userId);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const pageWidth = 595.28;
    const contentWidth = pageWidth - 100; // margins 50 each side

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').text('INVOICE', 50, 50);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Generated: ${new Date(invoice.generatedAt).toDateString()}`, 50, 78);

    // Payment badge
    const badgeColor = invoice.isPaid ? '#22c55e' : '#ef4444';
    const badgeText  = invoice.isPaid ? 'PAID' : 'UNPAID';
    doc.roundedRect(pageWidth - 120, 48, 70, 24, 4).fill(badgeColor);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff')
      .text(badgeText, pageWidth - 120, 55, { width: 70, align: 'center' });

    doc.moveTo(50, 100).lineTo(pageWidth - 50, 100).strokeColor('#e5e7eb').stroke();

    // ── Trip & Customer ──────────────────────────────────────────────────────
    doc.fillColor('#111111').fontSize(11).font('Helvetica-Bold')
      .text('Trip Details', 50, 115);
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(`Trip:     ${invoice.tripName}`, 50, 132)
      .text(`Region:   ${invoice.region}`, 50, 148)
      .text(`Dates:    ${invoice.startDate}  →  ${invoice.endDate}`, 50, 164)
      .text(`Duration: ${invoice.durationDays} day${invoice.durationDays !== 1 ? 's' : ''}`, 50, 180);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111111')
      .text('Billed To', pageWidth / 2, 115);
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(invoice.customer.name,  pageWidth / 2, 132)
      .text(invoice.customer.email, pageWidth / 2, 148);

    doc.moveTo(50, 210).lineTo(pageWidth - 50, 210).strokeColor('#e5e7eb').stroke();

    // ── Line Items Table ─────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111111')
      .text('Activities', 50, 225);

    // Table header
    const tableTop = 245;
    doc.rect(50, tableTop, contentWidth, 22).fill('#f3f4f6');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151')
      .text('Activity',       58,  tableTop + 7)
      .text('Type',           300, tableTop + 7)
      .text('$/Day',          380, tableTop + 7, { width: 55, align: 'right' })
      .text('Days',           440, tableTop + 7, { width: 35, align: 'right' })
      .text('Total',          480, tableTop + 7, { width: 65, align: 'right' });

    let y = tableTop + 22;
    invoice.lineItems.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, y, contentWidth, 20).fill('#fafafa');
      doc.fontSize(9).font('Helvetica').fillColor('#111111')
        .text(item.name,                58,  y + 6, { width: 235 })
        .text(item.type,                300, y + 6, { width: 75 })
        .text(`$${item.pricePerDay.toFixed(2)}`, 380, y + 6, { width: 55, align: 'right' })
        .text(String(item.durationDays),440, y + 6, { width: 35, align: 'right' })
        .text(`$${item.lineTotal.toFixed(2)}`,   480, y + 6, { width: 65, align: 'right' });
      y += 20;
    });

    doc.moveTo(50, y + 5).lineTo(pageWidth - 50, y + 5).strokeColor('#e5e7eb').stroke();

    // ── Summary ──────────────────────────────────────────────────────────────
    const summaryX = 380;
    y += 20;
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text('Subtotal',                summaryX, y, { width: 100 })
      .text(`$${invoice.summary.subtotal.toFixed(2)}`, summaryX + 100, y, { width: 65, align: 'right' });

    y += 18;
    doc.text(`Tax (${invoice.summary.taxRate}%)`, summaryX, y, { width: 100 })
      .text(`$${invoice.summary.taxAmount.toFixed(2)}`, summaryX + 100, y, { width: 65, align: 'right' });

    y += 10;
    doc.moveTo(summaryX, y + 5).lineTo(pageWidth - 50, y + 5).strokeColor('#9ca3af').stroke();
    y += 15;

    doc.rect(summaryX - 5, y, 175, 26).fill('#111111');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff')
      .text('Grand Total', summaryX, y + 8, { width: 100 })
      .text(`$${invoice.summary.grandTotal.toFixed(2)}`, summaryX + 100, y + 8, { width: 65, align: 'right' });

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
      .text('Traveloop — Thank you for your booking!', 50, 780, { align: 'center', width: contentWidth });

    doc.end();

    return new Promise<StreamableFile>((resolve) => {
      doc.on('end', () => {
        resolve(new StreamableFile(Buffer.concat(chunks)));
      });
    });
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

}
