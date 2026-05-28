import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ForumStatus } from '@prisma/client';
import { CreateForumDto } from './dto/create-forum.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/forums')
@UseGuards(RolesGuard)
export class ForumAdminController extends BaseAdminController<any> {
  constructor(private readonly forumService: ForumService) {
    super(forumService, 'forum');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createForumDto: CreateForumDto, @CurrentUser() user) {
    return this.forumService.create(createForumDto, user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.forumService.update(id, updateDto, user.id);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async publish(@Param('id') id: string) {
    return this.forumService.updateStatus(id, ForumStatus.PUBLISHED);
  }

  @Post(':id/unpublish')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async unpublish(@Param('id') id: string) {
    return this.forumService.unpublish(id);
  }
}
