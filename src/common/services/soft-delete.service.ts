import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationService } from './pagination.service';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

@Injectable()
export class SoftDeleteService<T> {
  protected model: string = '';

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {}

  async findAllDeleted(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma[this.model].findMany({
        skip,
        take,
        where: {
          deletedAt: {
            not: null,
          },
        },
      }),
      this.prisma[this.model].count({
        where: {
          deletedAt: {
            not: null,
          },
        },
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async softRemove(id: string): Promise<{ message: string }> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!entity) {
      throw new NotFoundException(`${this.model} not found`);
    }

    await this.prisma[this.model].update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: `${this.model} soft deleted successfully` };
  }

  async restore(id: string): Promise<{ message: string }> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { 
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!entity) {
      throw new NotFoundException(`Deleted ${this.model} not found`);
    }

    await this.prisma[this.model].update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return { message: `${this.model} restored successfully` };
  }
} 