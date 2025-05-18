import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';

@Injectable()
export class DepartmentService extends SoftDeleteService<any> {
  protected model = 'department';

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  /**
   * Creates a slug from a department name
   * @param name Department name
   * @returns Slug
   */
  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '');      // Trim - from end of text
  }

  async create(dto: CreateDepartmentDto) {
    const slug = this.createSlug(dto.department);
    
    return this.prisma.department.create({
      data: {
        department: dto.department,
        slug,
      },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.department.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
        include: {
          divisions: {
            include: {
              members: true,
            },
          },
        },
      }),
      this.prisma.department.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async findBySlug(slug: string) {
    const department = await this.prisma.department.findFirst({
      where: { 
        slug,
        deletedAt: null,
      },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // If department name is changing, update the slug too
    const data: any = {};
    if (dto.department) {
      data.department = dto.department;
      data.slug = this.createSlug(dto.department);
    }

    return this.prisma.department.update({
      where: { id },
      data,
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { message: 'Department permanently deleted successfully' };
  }
} 