import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CommonModule } from '../common/common.module';
import { EventAdminController } from './event-admin.controller';

@Module({
  imports: [CommonModule],
  controllers: [EventController, EventAdminController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {} 