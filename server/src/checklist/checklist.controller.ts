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
import { ChecklistService } from './checklist.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Checklist')
@ApiBearerAuth()
@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  // ─── Checklist ─────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get checklist for a trip (auto-created on first call)',
    description:
      'Returns the trip checklist with all sections and their items. ' +
      'If no checklist exists yet, one is created automatically.',
  })
  @ApiQuery({ name: 'trip_id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Checklist with nested sections and items' })
  @ApiResponse({ status: 403, description: 'Not the owner of this trip' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  getChecklist(
    @Query('trip_id', ParseIntPipe) tripId: number,
    @CurrentUser() user,
  ) {
    return this.checklistService.getChecklist(tripId, user.sub);
  }

  // ─── Sections ──────────────────────────────────────────────────────────────

  @Post('section')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a section to a checklist (e.g. "Documents", "Packing")' })
  @ApiResponse({ status: 201, description: 'Section created' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  createSection(@Body() dto: CreateSectionDto, @CurrentUser() user) {
    return this.checklistService.createSection(dto, user.sub);
  }

  @Patch('section/:id')
  @ApiOperation({ summary: 'Rename a checklist section (owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user,
  ) {
    return this.checklistService.updateSection(id, dto, user.sub);
  }

  @Delete('section/:id')
  @ApiOperation({ summary: 'Delete a section and all its items (owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  removeSection(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.checklistService.removeSection(id, user.sub);
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  @Post('item')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an item to a section (e.g. "Passport", "Flight tickets")' })
  @ApiResponse({ status: 201, description: 'Item created' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  createItem(@Body() dto: CreateItemDto, @CurrentUser() user) {
    return this.checklistService.createItem(dto, user.sub);
  }

  @Patch('item/:id')
  @ApiOperation({ summary: 'Update item title or mark as completed (owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Item updated' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemDto,
    @CurrentUser() user,
  ) {
    return this.checklistService.updateItem(id, dto, user.sub);
  }

  @Delete('item/:id')
  @ApiOperation({ summary: 'Delete a checklist item (owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  @ApiResponse({ status: 403, description: 'Not the owner' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  removeItem(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.checklistService.removeItem(id, user.sub);
  }
}
