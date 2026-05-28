import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateMemberDto } from './dto/create-member.dto';

@Controller('admin/members')
@UseGuards(RolesGuard)
export class MemberAdminController extends BaseAdminController<any> {
  constructor(private readonly memberService: MemberService) {
    super(memberService, 'member');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }
} 