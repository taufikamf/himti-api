import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.gallery.findMany({
      include: {
        event: true,
      },
    });
  }

  async findOne(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return gallery;
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
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

    return { message: 'Gallery deleted successfully' };
  }
} 