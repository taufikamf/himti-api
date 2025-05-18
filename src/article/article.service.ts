import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';

@Injectable()
export class ArticleService extends SoftDeleteService<any> {
  private readonly logger = new Logger(ArticleService.name);
  protected model = 'article';

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  async create(dto: CreateArticleDto, userId: string) {
    return this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        thumbnail: dto.thumbnail,
        author: dto.author,
        author_id: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    userId?: string,
  ): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.article.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_picture: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
          ...(userId
            ? {
                likes: {
                  where: {
                    user_id: userId,
                  },
                },
              }
            : {}),
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.article.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    // Log IDs for debugging
    this.logger.debug(
      `Found ${items.length} articles. IDs: ${items.map((item) => item.id).join(', ')}`,
    );

    // Add is_liked field to each article
    const enrichedItems = items.map((article) => ({
      ...article,
      is_liked: userId ? article.likes?.length > 0 : false,
      // Remove the likes array as it was only used to determine if_liked
      likes: undefined,
    }));

    return this.paginationService.createPaginationObject(
      enrichedItems,
      totalItems,
      paginationQuery,
    );
  }

  async findOne(id: string, userId?: string) {
    this.logger.debug(`Finding article with ID: ${id}`);

    try {
      const article = await this.prisma.article.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_picture: true,
            },
          },
          ...(userId
            ? {
                likes: {
                  where: {
                    user_id: userId,
                  },
                },
              }
            : {
                likes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        profile_picture: true,
                      },
                    },
                  },
                },
              }),
        },
      });

      this.logger.debug(
        `Article search result: ${article ? 'Found' : 'Not found'}`,
      );

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      // Add is_liked field
      const result = {
        ...article,
        is_liked: userId ? article.likes?.length > 0 : false,
        // If not authenticated user, keep the likes array for display
        ...(userId ? { likes: undefined } : {}),
      };

      return result;
    } catch (error) {
      this.logger.error(`Error finding article: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOneRobust(id: string, userId?: string) {
    this.logger.debug(`Finding article with ID (robust method): ${id}`);

    // Try straightforward lookup first
    try {
      const article = await this.prisma.article.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_picture: true,
            },
          },
          ...(userId
            ? {
                likes: {
                  where: {
                    user_id: userId,
                  },
                },
              }
            : {
                likes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        profile_picture: true,
                      },
                    },
                  },
                },
              }),
        },
      });

      if (article) {
        this.logger.debug('Article found with standard lookup');

        // Add is_liked field
        const result = {
          ...article,
          is_liked: userId ? article.likes?.length > 0 : false,
          // If not authenticated user, keep the likes array for display
          ...(userId ? { likes: undefined } : {}),
        };

        return result;
      }
    } catch (error) {
      this.logger.warn(`Standard lookup failed: ${error.message}`);
      // Continue to alternate methods if standard lookup fails
    }

    // If standard lookup fails, try a different approach by getting all and filtering
    try {
      this.logger.debug('Attempting to find article via findMany');
      const articles = await this.prisma.article.findMany({
        where: {
          id: {
            contains: id, // Try a less strict comparison
          },
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_picture: true,
            },
          },
          ...(userId
            ? {
                likes: {
                  where: {
                    user_id: userId,
                  },
                },
              }
            : {
                likes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        profile_picture: true,
                      },
                    },
                  },
                },
              }),
        },
        take: 1,
      });

      if (articles.length > 0) {
        this.logger.debug('Article found with contains lookup');
        const article = articles[0];

        // Add is_liked field
        const result = {
          ...article,
          is_liked: userId ? article.likes?.length > 0 : false,
          // If not authenticated user, keep the likes array for display
          ...(userId ? { likes: undefined } : {}),
        };

        return result;
      }
    } catch (error) {
      this.logger.warn(`Contains lookup failed: ${error.message}`);
      // Continue to final fallback
    }

    // Final fallback - try to find by title or content
    this.logger.debug('Attempting to find article by title or content');
    const articles = await this.prisma.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: id,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: id,
              mode: 'insensitive',
            },
          },
        ],
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        ...(userId
          ? {
              likes: {
                where: {
                  user_id: userId,
                },
              },
            }
          : {
              likes: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      profile_picture: true,
                    },
                  },
                },
              },
            }),
      },
      take: 1,
    });

    if (articles.length > 0) {
      this.logger.debug('Article found with title/content lookup');
      const article = articles[0];

      // Add is_liked field
      const result = {
        ...article,
        is_liked: userId ? article.likes?.length > 0 : false,
        // If not authenticated user, keep the likes array for display
        ...(userId ? { likes: undefined } : {}),
      };

      return result;
    }

    // If we get here, no article was found
    this.logger.debug('No article found with any lookup method');
    throw new NotFoundException('Article not found');
  }

  async update(id: string, dto: UpdateArticleDto, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author_id !== userId) {
      throw new NotFoundException('You can only update your own articles');
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        thumbnail: dto.thumbnail,
        author: dto.author,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
      },
    });
  }

  async softRemove(id: string, userId?: string): Promise<{ message: string }> {
    if (!userId) {
      return super.softRemove(id);
    }

    const article = await this.prisma.article.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author_id !== userId) {
      throw new NotFoundException('You can only delete your own articles');
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Article soft deleted successfully' };
  }

  async remove(id: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author_id !== userId) {
      throw new NotFoundException('You can only delete your own articles');
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Article permanently deleted successfully' };
  }

  async restore(id: string, userId?: string): Promise<{ message: string }> {
    if (!userId) {
      return super.restore(id);
    }

    const article = await this.prisma.article.findUnique({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Deleted article not found');
    }

    if (article.author_id !== userId) {
      throw new NotFoundException('You can only restore your own articles');
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return { message: 'Article restored successfully' };
  }

  async like(articleId: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        id: articleId,
        deletedAt: null,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if the user has already liked the article
    const existingLike = await this.prisma.articleLike.findUnique({
      where: {
        article_id_user_id: {
          article_id: articleId,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      // If like exists, remove it (unlike)
      await this.prisma.articleLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    } else {
      // If like doesn't exist, create it (like)
      await this.prisma.articleLike.create({
        data: {
          article_id: articleId,
          user_id: userId,
        },
      });
      return { liked: true };
    }
  }
}
