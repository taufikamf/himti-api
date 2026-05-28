import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Controller('admin/departments')
@UseGuards(RolesGuard)
export class DepartmentAdminController extends BaseAdminController<any> {
  constructor(private readonly departmentService: DepartmentService) {
    super(departmentService, 'department');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }
} 