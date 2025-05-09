import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDataDto } from './dto/create-bank-data.dto';
import { UpdateBankDataDto } from './dto/update-bank-data.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class BankDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(dto: CreateBankDataDto) {
    return this.prisma.bankData.create({
      data: {
        title: dto.title,
        link: dto.link,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.bankData.findMany({
        skip,
        take,
      }),
      this.prisma.bankData.count(),
    ]);

    return this.paginationService.createPaginationObject(items, totalItems, paginationQuery);
  }

  async findOne(id: string) {
    const bankData = await this.prisma.bankData.findUnique({
      where: { id },
    });

    if (!bankData) {
      throw new NotFoundException('Bank data not found');
    }

    return bankData;
  }

  async update(id: string, dto: UpdateBankDataDto) {
    const bankData = await this.prisma.bankData.findUnique({
      where: { id },
    });

    if (!bankData) {
      throw new NotFoundException('Bank data not found');
    }

    return this.prisma.bankData.update({
      where: { id },
      data: {
        title: dto.title,
        link: dto.link,
      },
    });
  }

  async remove(id: string) {
    const bankData = await this.prisma.bankData.findUnique({
      where: { id },
    });

    if (!bankData) {
      throw new NotFoundException('Bank data not found');
    }

    await this.prisma.bankData.delete({
      where: { id },
    });

    return { message: 'Bank data deleted successfully' };
  }
} 