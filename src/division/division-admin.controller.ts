import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DivisionService } from './division.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateDivisionDto } from './dto/create-division.dto';

@Controller('admin/divisions')
@UseGuards(RolesGuard)
export class DivisionAdminController extends BaseAdminController<any> {
  constructor(private readonly divisionService: DivisionService) {
    super(divisionService, 'division');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionService.create(createDivisionDto);
  }
} 