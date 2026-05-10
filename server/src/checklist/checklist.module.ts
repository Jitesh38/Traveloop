import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripChecklist } from './entities/trip-checklist.entity';
import { TripChecklistSection } from './entities/trip-checklist-section.entity';
import { TripChecklistItem } from './entities/trip-checklist-item.entity';
import { MyTrip } from '../activity/entities/my-trip.entity';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripChecklist, TripChecklistSection, TripChecklistItem, MyTrip]),
  ],
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}
