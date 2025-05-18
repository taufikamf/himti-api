import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { PublicGuard } from '../auth/guards/public.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller('galleries')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createGalleryDto: CreateGalleryDto) {
    return this.galleryService.create(createGalleryDto);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.galleryService.findAll(paginationQuery);
  }

  @Get('deleted')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findAllDeleted(@Query() paginationQuery: PaginationQueryDto) {
    return this.galleryService.findAllDeleted(paginationQuery);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.galleryService.findByEvent(eventId);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateGalleryDto: UpdateGalleryDto) {
    return this.galleryService.update(id, updateGalleryDto);
  }

  @Delete(':id/soft')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  softRemove(@Param('id') id: string) {
    return this.galleryService.softRemove(id);
  }

  @Delete(':id/permanent')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  restore(@Param('id') id: string) {
    return this.galleryService.restore(id);
  }
}
