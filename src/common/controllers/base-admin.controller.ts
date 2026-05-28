import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SoftDeleteService } from '../services/soft-delete.service';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(RolesGuard)
export abstract class BaseAdminController<T> {
  constructor(
    protected readonly service: SoftDeleteService<T>,
    protected readonly entityName: string
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponse<T>> {
    try {
      return await this.service.findAll(paginationQuery);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error fetching ${this.entityName} list: ${error.message}`);
    }
  }

  @Get('deleted')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAllDeleted(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponse<T>> {
    try {
      return await this.service.findAllDeleted(paginationQuery);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error fetching deleted ${this.entityName} list: ${error.message}`);
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findOne(@Param('id') id: string): Promise<T> {
    try {
      return await this.service.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error fetching ${this.entityName}: ${error.message}`);
    }
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createDto: any, @CurrentUser() user?: any): Promise<T> {
    try {
      if (this.service['create']) {
        return await this.service['create'](createDto, user?.id);
      }
      throw new BadRequestException(`Create method not implemented for ${this.entityName}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error creating ${this.entityName}: ${error.message}`);
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user?: any): Promise<T> {
    try {
      return await this.service.update(id, updateDto, user?.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error updating ${this.entityName}: ${error.message}`);
    }
  }

  @Delete(':id/soft')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async softRemove(@Param('id') id: string, @CurrentUser() user?: any): Promise<{ message: string }> {
    try {
      return await this.service.softRemove(id, user?.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error soft deleting ${this.entityName}: ${error.message}`);
    }
  }

  @Delete(':id/permanent')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user?: any): Promise<{ message: string }> {
    try {
      return await this.service.remove(id, user?.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error permanently deleting ${this.entityName}: ${error.message}`);
    }
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async restore(@Param('id') id: string, @CurrentUser() user?: any): Promise<{ message: string }> {
    try {
      return await this.service.restore(id, user?.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error restoring ${this.entityName}: ${error.message}`);
    }
  }
} 