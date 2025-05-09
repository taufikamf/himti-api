import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(dto: CreateMemberDto) {
    const member = await this.prisma.member.create({
      data: {
        name: dto.name,
        position: dto.position,
        photo: dto.photo,
        division_id: dto.division_id,
        role: dto.role,
      },
      include: {
        division: true,
      },
    });
    return member;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.member.findMany({
        skip,
        take,
        include: {
          division: {
            include: {
              department: true,
            }
          },
        },
      }),
      this.prisma.member.count(),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async update(id: string, dto: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.member.update({
      where: { id },
      data: {
        name: dto.name,
        position: dto.position,
        photo: dto.photo,
        division_id: dto.division_id,
        role: dto.role,
      },
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.member.delete({
      where: { id },
    });

    return { message: 'Member deleted successfully' };
  }
} 