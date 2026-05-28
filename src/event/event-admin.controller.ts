import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('admin/events')
@UseGuards(RolesGuard)
export class EventAdminController extends BaseAdminController<any> {
  constructor(private readonly eventService: EventService) {
    super(eventService, 'event');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }
} 