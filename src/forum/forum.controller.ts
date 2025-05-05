import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ForumStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('forums')
@UseGuards(RolesGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  create(@Body() createForumDto: CreateForumDto, @CurrentUser() user) {
    return this.forumService.create(createForumDto, user.id);
  }

  @Get()
  findAll(@Query('status') status?: ForumStatus) {
    return this.forumService.findAll(status);
  }

  @Get('my-forums')
  findMyForums(@CurrentUser() user) {
    return this.forumService.findMyForums(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @CurrentUser() user,
  ) {
    return this.forumService.update(id, updateForumDto, user.id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ForumStatus,
    @CurrentUser() user,
  ) {
    return this.forumService.updateStatus(id, status, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.forumService.remove(id, user.id);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @CurrentUser() user) {
    return this.forumService.like(id, user.id);
  }

  @Post(':id/comment')
  comment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @CurrentUser() user,
  ) {
    return this.forumService.comment(id, comment, user.id);
  }
} 