import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';

@Injectable()
export class EventService extends SoftDeleteService<any> {
  protected model = 'event';
  protected searchFields = ['name', 'description'];

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description || null,
      },
      include: {
        gallery: true,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const searchCondition = this.getSearchCondition(paginationQuery.search);
    
    const where = {
      deletedAt: null,
      ...searchCondition,
    };

    const [items, totalItems] = await Promise.all([
      this.prisma.event.findMany({
        skip,
        take,
        where,
        include: {
          gallery: {
            where: {
              deletedAt: null,
            },
          },
        },
      }),
      this.prisma.event.count({
        where,
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        gallery: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
      include: {
        gallery: true,
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event permanently deleted successfully' };
  }
} 