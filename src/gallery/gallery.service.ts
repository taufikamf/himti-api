import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';

@Injectable()
export class GalleryService extends SoftDeleteService<any> {
  protected model = 'gallery';

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  async create(dto: CreateGalleryDto) {
    return this.prisma.gallery.create({
      data: {
        event_id: dto.event_id,
        photo_url: dto.photo_url,
      },
      include: {
        event: true,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    // First get all events with pagination
    const [events, totalEvents] = await Promise.all([
      this.prisma.event.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.event.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    // For each event, get up to 4 gallery items
    const items = await Promise.all(
      events.map(async (event) => {
        const galleryItems = await this.prisma.gallery.findMany({
          where: {
            event_id: event.id,
            deletedAt: null,
          },
          take: 4, // Limit to 4 items per event
          orderBy: {
            id: 'desc', // Get the most recent items
          },
        });

        return {
          ...event,
          gallery: galleryItems,
          total_gallery_items: await this.prisma.gallery.count({
            where: {
              event_id: event.id,
              deletedAt: null,
            },
          }),
        };
      })
    );

    return this.paginationService.createPaginationObject(items, totalEvents, paginationQuery);
  }

  async findOne(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        event: true,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return gallery;
  }

  async findByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { 
        id: eventId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const galleryItems = await this.prisma.gallery.findMany({
      where: {
        event_id: eventId,
        deletedAt: null,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      ...event,
      gallery: galleryItems,
    };
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return this.prisma.gallery.update({
      where: { id },
      data: {
        event_id: dto.event_id,
        photo_url: dto.photo_url,
      },
      include: {
        event: true,
      },
    });
  }

  async remove(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    await this.prisma.gallery.delete({
      where: { id },
    });

    return { message: 'Gallery permanently deleted successfully' };
  }
} 