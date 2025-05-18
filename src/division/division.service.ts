import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';

@Injectable()
export class DivisionService extends SoftDeleteService<any> {
  protected model = 'division';

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  /**
   * Creates a slug from a division name
   * @param name Division name
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

  async create(dto: CreateDivisionDto) {
    const slug = this.createSlug(dto.division);
    
    return this.prisma.division.create({
      data: {
        division: dto.division,
        department_id: dto.department_id,
        slug,
      },
      include: {
        department: true,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.division.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
        include: {
          department: true,
          members: true,
        },
      }),
      this.prisma.division.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string) {
    const division = await this.prisma.division.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        department: true,
        members: true,
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return division;
  }

  async findBySlug(slug: string) {
    const division = await this.prisma.division.findFirst({
      where: { 
        slug,
        deletedAt: null,
      },
      include: {
        department: true,
        members: true,
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return division;
  }

  async update(id: string, dto: UpdateDivisionDto) {
    const division = await this.prisma.division.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    // Prepare data with possible slug update
    const data: any = {};
    
    // If division name is changing, update the slug too
    if (dto.division) {
      data.division = dto.division;
      data.slug = this.createSlug(dto.division);
    }
    
    if (dto.department_id) {
      data.department_id = dto.department_id;
    }

    return this.prisma.division.update({
      where: { id },
      data,
      include: {
        department: true,
        members: true,
      },
    });
  }

  async remove(id: string) {
    const division = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    await this.prisma.division.delete({
      where: { id },
    });

    return { message: 'Division permanently deleted successfully' };
  }
} 