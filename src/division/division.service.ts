import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDivisionDto) {
    return this.prisma.division.create({
      data: {
        division: dto.division,
        department_id: dto.department_id,
      },
      include: {
        department: true,
        members: true,
      },
    });
  }

  async findAll() {
    return this.prisma.division.findMany({
      include: {
        department: true,
        members: true,
      },
    });
  }

  async findOne(id: string) {
    const division = await this.prisma.division.findUnique({
      where: { id },
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
      where: { id },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return this.prisma.division.update({
      where: { id },
      data: {
        division: dto.division,
        department_id: dto.department_id,
      },
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

    return { message: 'Division deleted successfully' };
  }
} 