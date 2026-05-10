import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { MyTrip } from '../activity/entities/my-trip.entity';
import { TripActivity } from '../activity/entities/trip-activity.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Region } from '../activity/entities/region.entity';
import { Review } from '../review/entities/review.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MyTrip, TripActivity, Activity, Region, Review]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
