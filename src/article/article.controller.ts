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
  Logger,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PublicGuard } from '../auth/guards/public.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller('articles')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);

  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createArticleDto: CreateArticleDto, @CurrentUser() user) {
    return this.articleService.create(createArticleDto, user.id);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto, @Request() req) {
    // For public endpoints, the user might not be authenticated
    const userId = req.user?.id;
    return this.articleService.findAll(paginationQuery, userId);
  }

  @Get('deleted')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findAllDeleted(@Query() paginationQuery: PaginationQueryDto) {
    return this.articleService.findAllDeleted(paginationQuery);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get('debug/:id')
  async debugFindOne(@Param('id') id: string) {
    this.logger.debug(`Debug endpoint: Received article ID: ${id}`);
    
    try {
      // Try a direct query to see if the article exists
      const article = await this.articleService['prisma'].article.findUnique({
        where: { id },
        select: { id: true }
      });
      
      this.logger.debug(`Debug result: ${article ? 'Found' : 'Not found'}`);
      
      // Also get a list of all article IDs to compare
      const allArticles = await this.articleService['prisma'].article.findMany({
        select: { id: true },
        take: 5 // Limit to 5 for brevity
      });
      
      const articleIds = allArticles.map(a => a.id);
      this.logger.debug(`First 5 article IDs: ${articleIds.join(', ')}`);
      
      return {
        searchedId: id,
        found: !!article,
        exactIdMatch: articleIds.includes(id),
        sampleIds: articleIds
      };
    } catch (error) {
      this.logger.error(`Debug error: ${error.message}`, error.stack);
      return {
        error: error.message,
        searchedId: id
      };
    }
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get('robust/:id')
  findOneRobust(@Param('id') id: string, @Request() req) {
    this.logger.debug(`Received request for article with ID (robust endpoint): ${id}`);
    // For public endpoints, the user might not be authenticated
    const userId = req.user?.id;
    return this.articleService.findOneRobust(id, userId);
  }

  @Public()
  @UseGuards(PublicGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    this.logger.debug(`Received request for article with ID: ${id}`);
    // For public endpoints, the user might not be authenticated
    const userId = req.user?.id;
    return this.articleService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user,
  ) {
    return this.articleService.update(id, updateArticleDto, user.id);
  }

  @Delete(':id/soft')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  softRemove(@Param('id') id: string, @CurrentUser() user) {
    return this.articleService.softRemove(id, user.id);
  }

  @Delete(':id/permanent')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.articleService.remove(id, user.id);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  restore(@Param('id') id: string, @CurrentUser() user) {
    return this.articleService.restore(id, user.id);
  }

  @Public()
  @Post(':id/like')
  like(@Param('id') id: string, @Request() req) {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedException('You must be logged in to like articles');
    }
    return this.articleService.like(id, req.user.id);
  }
} 