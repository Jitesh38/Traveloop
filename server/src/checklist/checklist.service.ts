import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripChecklist } from './entities/trip-checklist.entity';
import { TripChecklistSection } from './entities/trip-checklist-section.entity';
import { TripChecklistItem } from './entities/trip-checklist-item.entity';
import { MyTrip } from '../activity/entities/my-trip.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(TripChecklist)
    private readonly checklistRepo: Repository<TripChecklist>,
    @InjectRepository(TripChecklistSection)
    private readonly sectionRepo: Repository<TripChecklistSection>,
    @InjectRepository(TripChecklistItem)
    private readonly itemRepo: Repository<TripChecklistItem>,
    @InjectRepository(MyTrip)
    private readonly tripRepo: Repository<MyTrip>,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async assertTripOwner(tripId: number, userId: string): Promise<MyTrip> {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException(`Trip with id ${tripId} not found`);
    if (trip.userId !== userId)
      throw new ForbiddenException('You do not have permission to access this trip');
    return trip;
  }

  private async assertChecklistOwner(checklistId: number, userId: string): Promise<TripChecklist> {
    const checklist = await this.checklistRepo.findOne({
      where: { id: checklistId },
      relations: ['myTrip'],
    });
    if (!checklist) throw new NotFoundException(`Checklist with id ${checklistId} not found`);
    if (checklist.myTrip.userId !== userId)
      throw new ForbiddenException('You do not have permission to modify this checklist');
    return checklist;
  }

  private async assertSectionOwner(sectionId: number, userId: string): Promise<TripChecklistSection> {
    const section = await this.sectionRepo.findOne({
      where: { id: sectionId },
      relations: ['checklist', 'checklist.myTrip'],
    });
    if (!section) throw new NotFoundException(`Section with id ${sectionId} not found`);
    if (section.checklist.myTrip.userId !== userId)
      throw new ForbiddenException('You do not have permission to modify this section');
    return section;
  }

  private async assertItemOwner(itemId: number, userId: string): Promise<TripChecklistItem> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['section', 'section.checklist', 'section.checklist.myTrip'],
    });
    if (!item) throw new NotFoundException(`Item with id ${itemId} not found`);
    if (item.section.checklist.myTrip.userId !== userId)
      throw new ForbiddenException('You do not have permission to modify this item');
    return item;
  }

  // ─── Checklist (get or create) ─────────────────────────────────────────────

  async getChecklist(tripId: number, userId: string): Promise<TripChecklist> {
    await this.assertTripOwner(tripId, userId);

    let checklist = await this.checklistRepo.findOne({
      where: { myTripId: tripId },
      relations: ['sections', 'sections.items'],
      order: { sections: { createdAt: 'ASC', items: { createdAt: 'ASC' } } },
    });

    if (!checklist) {
      checklist = await this.checklistRepo.save(
        this.checklistRepo.create({ myTripId: tripId }),
      );
      checklist.sections = [];
    }

    return checklist;
  }

  // ─── Sections ──────────────────────────────────────────────────────────────

  async createSection(dto: CreateSectionDto, userId: string): Promise<TripChecklistSection> {
    await this.assertChecklistOwner(dto.checklistId, userId);
    const section = this.sectionRepo.create({ checklistId: dto.checklistId, title: dto.title });
    return this.sectionRepo.save(section);
  }

  async updateSection(
    sectionId: number,
    dto: UpdateSectionDto,
    userId: string,
  ): Promise<TripChecklistSection> {
    const section = await this.assertSectionOwner(sectionId, userId);
    section.title = dto.title;
    return this.sectionRepo.save(section);
  }

  async removeSection(sectionId: number, userId: string): Promise<{ success: boolean; message: string }> {
    await this.assertSectionOwner(sectionId, userId);
    await this.sectionRepo.delete(sectionId);
    return { success: true, message: 'Section deleted successfully' };
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  async createItem(dto: CreateItemDto, userId: string): Promise<TripChecklistItem> {
    await this.assertSectionOwner(dto.sectionId, userId);
    const item = this.itemRepo.create({ sectionId: dto.sectionId, title: dto.title });
    return this.itemRepo.save(item);
  }

  async updateItem(
    itemId: number,
    dto: UpdateItemDto,
    userId: string,
  ): Promise<TripChecklistItem> {
    const item = await this.assertItemOwner(itemId, userId);
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.isCompleted !== undefined) item.isCompleted = dto.isCompleted;
    return this.itemRepo.save(item);
  }

  async removeItem(itemId: number, userId: string): Promise<{ success: boolean; message: string }> {
    await this.assertItemOwner(itemId, userId);
    await this.itemRepo.delete(itemId);
    return { success: true, message: 'Item deleted successfully' };
  }
}
