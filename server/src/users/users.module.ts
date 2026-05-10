import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UploadModule } from '../modules/upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UploadModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
