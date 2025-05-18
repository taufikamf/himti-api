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
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Public } from '../auth/decorators/public.decorator';
import { PublicGuard } from '../auth/guards/public.guard';

@Controller('divisions')
export class DivisionController {
  constructor(
    private readonly divisionService: DivisionService,
    private readonly paginationService: PaginationService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionService.create(createDivisionDto);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    // For safe pagination without modifying the service method that might be called by other code
    const divisions = await this.divisionService.findAll(paginationQuery);
    return divisions;
  }

  @Get('deleted')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findAllDeleted(@Query() paginationQuery: PaginationQueryDto) {
    return this.divisionService.findAllDeleted(paginationQuery);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.divisionService.findOne(id);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.divisionService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDivisionDto: UpdateDivisionDto,
  ) {
    return this.divisionService.update(id, updateDivisionDto);
  }

  @Delete(':id/soft')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  softRemove(@Param('id') id: string) {
    return this.divisionService.softRemove(id);
  }

  @Delete(':id/permanent')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.divisionService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  restore(@Param('id') id: string) {
    return this.divisionService.restore(id);
  }
}
