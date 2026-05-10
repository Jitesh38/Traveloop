import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Stats ─────────────────────────────────────────────────────────────────

  @Get('stats/overview')
  @ApiOperation({
    summary: 'Platform overview',
    description: 'Totals for users, trips, activities, reviews, and estimated revenue from paid trips.',
  })
  @ApiResponse({ status: 200, description: 'Overview stats' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('stats/trips-over-time')
  @ApiOperation({
    summary: 'Trips created per month',
    description: 'Monthly trip creation count for the last 12 months.',
  })
  @ApiResponse({ status: 200, description: 'Array of { month, trips }' })
  getTripsOverTime() {
    return this.adminService.getTripsOverTime();
  }

  @Get('stats/top-regions')
  @ApiOperation({ summary: 'Top regions by number of trips booked' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Default 10' })
  @ApiResponse({ status: 200, description: 'Regions ordered by trip_count desc' })
  getTopRegions(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.adminService.getTopRegions(limit);
  }

  @Get('stats/top-activities')
  @ApiOperation({ summary: 'Top activities by number of bookings' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Default 10' })
  @ApiResponse({ status: 200, description: 'Activities ordered by booking_count desc' })
  getTopActivities(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.adminService.getTopActivities(limit);
  }

  @Get('stats/user-engagement')
  @ApiOperation({
    summary: 'User engagement stats',
    description: 'Average trips and reviews per user, plus top 10 most active users.',
  })
  @ApiResponse({ status: 200, description: 'Engagement metrics' })
  getUserEngagement() {
    return this.adminService.getUserEngagement();
  }

  // ─── User management ───────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'page',   required: false, type: Number, description: 'Default 1' })
  @ApiQuery({ name: 'limit',  required: false, type: Number, description: 'Default 20' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  getUsers(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search?.trim() || undefined);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail with trip and review counts' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User detail with stats and recent trips' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Enable or disable a user account' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  setUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.setUserStatus(id, isActive);
  }
}
