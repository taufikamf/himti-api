import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

@Injectable()
export class PaginationService {
  createPaginationObject<T>(
    items: T[],
    totalItems: number,
    paginationQuery: PaginationQueryDto,
  ): PaginatedResponse<T> {
    const { page = 1, limit = 10 } = paginationQuery;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: items,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  getPrismaSkip(paginationQuery: PaginationQueryDto): number {
    const { page = 1, limit = 10 } = paginationQuery;
    return (page - 1) * limit;
  }

  getPrismaLimit(paginationQuery: PaginationQueryDto): number {
    return paginationQuery.limit || 10;
  }

  /**
   * Paginate an existing array of items
   * This is useful for backward compatibility without modifying existing service methods
   */
  paginateArray<T>(items: T[], paginationQuery: PaginationQueryDto): PaginatedResponse<T> {
    const { page = 1, limit = 10 } = paginationQuery;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalItems = items.length;
    
    return this.createPaginationObject(paginatedItems, totalItems, paginationQuery);
  }
} 