import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async findAndAuthorise(id: number, userId: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review with id ${id} not found`);
    if (review.userId !== userId)
      throw new ForbiddenException('You do not have permission to modify this review');
    return review;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  findAll(regionId?: number, activityId?: number): Promise<Review[]> {
    const where: any = {};
    if (regionId)   where.regionId   = regionId;
    if (activityId) where.activityId = activityId;

    return this.reviewRepo.find({
      where,
      relations: ['user', 'region', 'activity'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    if (!dto.regionId && !dto.activityId) {
      throw new BadRequestException(
        'At least one of regionId or activityId must be provided',
      );
    }

    const review = this.reviewRepo.create({ ...dto, userId });
    return this.reviewRepo.save(review);
  }

  async update(id: number, dto: UpdateReviewDto, userId: string): Promise<Review> {
    const review = await this.findAndAuthorise(id, userId);
    if (dto.rating !== undefined)     review.rating     = dto.rating;
    if (dto.experience !== undefined) review.experience = dto.experience;
    return this.reviewRepo.save(review);
  }

  async remove(id: number, userId: string): Promise<{ success: boolean; message: string }> {
    await this.findAndAuthorise(id, userId);
    await this.reviewRepo.delete(id);
    return { success: true, message: 'Review deleted successfully' };
  }
}
