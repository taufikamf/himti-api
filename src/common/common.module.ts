import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SoftDeleteService } from './services/soft-delete.service';

@Module({
  imports: [PrismaModule],
  providers: [PaginationService, SoftDeleteService],
  exports: [PaginationService, SoftDeleteService],
})
export class CommonModule {} 