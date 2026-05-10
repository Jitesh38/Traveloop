import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CreateMyTripDto } from './dto/create-my-trip.dto';
import { UpdateTripActivityDto } from './dto/update-trip-activity.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('my-trips')
  @ApiOperation({
    summary: 'Get my trips',
    description:
      'Returns the authenticated user\'s trips divided into ongoing, previous, and planned. Use ?timeline= to get a single flat array for one category.',
  })
  @ApiQuery({
    name: 'timeline',
    required: false,
    enum: ['ongoing', 'previous', 'planned'],
    description: 'Filter to a single timeline bucket. Omit to get all three.',
  })
  @ApiResponse({ status: 200, description: 'Trips returned successfully' })
  getMyTrips(
    @CurrentUser() user,
    @Query('timeline') timeline?: 'ongoing' | 'previous' | 'planned',
  ) {
    return this.activityService.getMyTrips(user.sub, timeline);
  }

  @Get('regions')
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({ status: 200, description: 'List of all regions ordered by name' })
  getAllRegions() {
    return this.activityService.getAllRegions();
  }

  @Get('trip-activity')
  @ApiOperation({ summary: 'Get all trip activities for a trip' })
  @ApiQuery({ name: 'trip_id', type: Number, description: 'ID of the trip' })
  @ApiResponse({ status: 200, description: 'Trip activities returned successfully' })
  @ApiResponse({ status: 403, description: 'You do not have access to this trip' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  getTripActivities(
    @Query('trip_id', ParseIntPipe) tripId: number,
    @CurrentUser() user,
  ) {
    return this.activityService.getTripActivities(tripId, user.sub);
  }

  @Patch('trip-activity/:id')
  @ApiOperation({
    summary: 'Update a trip activity',
    description: 'Updates scheduling and details of a trip activity. Only the owner of the parent trip can update. totalHours is auto-recalculated from startDateTime and endDateTime.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Trip activity ID' })
  @ApiResponse({ status: 200, description: 'Trip activity updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid datetime range' })
  @ApiResponse({ status: 403, description: 'You do not have access to this trip activity' })
  @ApiResponse({ status: 404, description: 'Trip activity not found' })
  updateTripActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTripActivityDto,
    @CurrentUser() user,
  ) {
    return this.activityService.updateTripActivity(id, dto, user.sub);
  }

  @Post('create-my-trip')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a trip with activities',
    description:
      'Creates a TripActivity for each activityId, then creates a MyTrip linked to them. The region is auto-resolved from the first activity.',
  })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid dates or request body' })
  @ApiResponse({ status: 404, description: 'One or more activities not found' })
  createMyTrip(@Body() dto: CreateMyTripDto, @CurrentUser() user) {
    return this.activityService.createMyTrip(dto, user.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'Get / search activities',
    description: 'Returns all activities. Filter by region and/or search across name, tag line, and description. Filters are combinable.',
  })
  @ApiQuery({ name: 'region_id', required: false, type: Number, description: 'Filter by region ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name, tag line and description (case-insensitive)' })
  @ApiResponse({ status: 200, description: 'List of matching activities ordered by name' })
  findAll(
    @Query('region_id') regionId?: string,
    @Query('search') search?: string,
  ) {
    return this.activityService.findAll(
      regionId ? +regionId : undefined,
      search?.trim() || undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activityService.update(+id, updateActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }
}
