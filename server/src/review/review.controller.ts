import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all reviews',
    description: 'Optionally filter by regionId and/or activityId. Results ordered newest first.',
  })
  @ApiQuery({ name: 'region_id',   required: false, type: Number, description: 'Filter by region' })
  @ApiQuery({ name: 'activity_id', required: false, type: Number, description: 'Filter by activity' })
  @ApiResponse({ status: 200, description: 'List of reviews with user, region and activity details' })
  findAll(
    @Query('region_id')   regionId?: string,
    @Query('activity_id') activityId?: string,
  ) {
    return this.reviewService.findAll(
      regionId   ? +regionId   : undefined,
      activityId ? +activityId : undefined,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a review',
    description: 'At least one of regionId or activityId must be provided.',
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Neither regionId nor activityId provided, or validation failed' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user) {
    return this.reviewService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review (owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the owner of this review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user,
  ) {
    return this.reviewService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review (owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the owner of this review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.reviewService.remove(id, user.sub);
  }
}
