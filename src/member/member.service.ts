import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMemberDto) {
    const member = await this.prisma.member.create({
      data: {
        name: dto.name,
        position: dto.position,
        photo: dto.photo,
        division_id: dto.division_id,
      },
      include: {
        division: true,
      },
    });
    return member;
  }

  async findAll() {
    return this.prisma.member.findMany({
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });
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