import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';

@Injectable()
export class UserService extends SoftDeleteService<any> {
  protected model = 'user';

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profile_picture: true,
        },
      }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findAllDeleted(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where: {
          deletedAt: {
            not: null,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profile_picture: true,
          deletedAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          deletedAt: {
            not: null,
          },
        },
      }),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        profile_picture: dto.profile_picture,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
      },
    });
  }

  async softRemove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'User soft deleted successfully' };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User permanently deleted successfully' };
  }

  async restore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Deleted user not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return { message: 'User restored successfully' };
  }
} 