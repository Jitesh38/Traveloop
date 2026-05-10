import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { Activity } from './entities/activity.entity';
import { TripActivity } from './entities/trip-activity.entity';
import { MyTrip } from './entities/my-trip.entity';
import { Region } from './entities/region.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, TripActivity, MyTrip, Region, User])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
