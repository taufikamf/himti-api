import { Controller, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { ArticleService } from './article.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/articles')
@UseGuards(RolesGuard)
export class ArticleAdminController extends BaseAdminController<any> {
  constructor(private readonly articleService: ArticleService) {
    super(articleService, 'article');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createArticleDto: CreateArticleDto, @CurrentUser() user) {
    return this.articleService.create(createArticleDto, user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string, 
    @Body() updateDto: any, 
    @CurrentUser() user: any
  ): Promise<any> {
    return this.articleService.update(id, updateDto, user.id);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async publish(@Param('id') id: string) {
    return this.articleService.publish(id);
  }

  @Post(':id/unpublish')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async unpublish(@Param('id') id: string) {
    return this.articleService.unpublish(id);
  }
} 