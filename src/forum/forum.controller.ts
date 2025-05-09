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
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ForumStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PublicGuard } from '../auth/guards/public.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ForumQueryDto } from './dto/forum-query.dto';

@Controller('forums')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  @UseGuards(RolesGuard)
  create(@Body() createForumDto: CreateForumDto, @CurrentUser() user) {
    return this.forumService.create(createForumDto, user.id);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get()
  findAll(@Query() forumQuery: ForumQueryDto, @Request() req) {
    // For public endpoints, the user might not be authenticated
    const userId = req.user?.id;
    return this.forumService.findAll(forumQuery, forumQuery.status, userId);
  }

  @Get('my-forums')
  @UseGuards(RolesGuard)
  findMyForums(
    @CurrentUser() user,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.forumService.findMyForums(user.id, paginationQuery);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // For public endpoints, the user might not be authenticated
    const userId = req.user?.id;
    return this.forumService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @CurrentUser() user,
  ) {
    return this.forumService.update(id, updateForumDto, user.id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ForumStatus,
    @CurrentUser() user,
  ) {
    return this.forumService.updateStatus(id, status, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.forumService.remove(id, user.id);
  }

  @Public()
  @Post(':id/like')
  like(@Param('id') id: string, @Request() req) {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedException('You must be logged in to like forums');
    }
    return this.forumService.like(id, req.user.id);
  }

  @Post(':id/comment')
  @UseGuards(RolesGuard)
  comment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @CurrentUser() user,
  ) {
    return this.forumService.comment(id, comment, user.id);
  }
}
