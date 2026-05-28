import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationService } from './pagination.service';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class SoftDeleteService<T> {
  protected model: string = '';
  protected searchFields: string[] = [];

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {}

  protected getSearchCondition(search?: string): any {
    if (!search || !this.searchFields || this.searchFields.length === 0) {
      return {};
    }

    const searchConditions = this.searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as Prisma.QueryMode,
      },
    }));

    return { OR: searchConditions };
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);
    
    const searchCondition = this.getSearchCondition(paginationQuery.search);
    
    const where = {
      deletedAt: null,
      ...searchCondition,
    };

    const [items, totalItems] = await Promise.all([
      this.prisma[this.model].findMany({
        skip,
        take,
        where,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma[this.model].count({
        where,
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findAllDeleted(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);
    
    const searchCondition = this.getSearchCondition(paginationQuery.search);
    
    const where = {
      deletedAt: {
        not: null,
      },
      ...searchCondition,
    };

    const [items, totalItems] = await Promise.all([
      this.prisma[this.model].findMany({
        skip,
        take,
        where,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma[this.model].count({
        where,
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string): Promise<any> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { 
        id,
      },
    });

    if (!entity || entity.deletedAt !== null) {
      throw new NotFoundException(`${this.model} not found`);
    }

    return entity;
  }

  async update(id: string, updateDto: any, userId?: string): Promise<any> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { 
        id,
      },
    });

    if (!entity || entity.deletedAt !== null) {
      throw new NotFoundException(`${this.model} not found`);
    }

    return this.prisma[this.model].update({
      where: { id },
      data: updateDto,
    });
  }

  async softRemove(id: string, userId?: string): Promise<{ message: string }> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { 
        id,
      },
    });

    if (!entity || entity.deletedAt !== null) {
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

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`${this.model} not found`);
    }

    await this.prisma[this.model].delete({
      where: { id },
    });

    return { message: `${this.model} permanently deleted successfully` };
  }

  async restore(id: string, userId?: string): Promise<{ message: string }> {
    if (!this.model) {
      throw new Error('Model name not set in service extending SoftDeleteService');
    }
    
    const entity = await this.prisma[this.model].findUnique({
      where: { 
        id,
      },
    });

    if (!entity || entity.deletedAt === null) {
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