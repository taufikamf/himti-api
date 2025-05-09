import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

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
      this.prisma.article.count(),
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
        where: { id },
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
        where: { id },
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
        take: 1, // Just get the first matching one
      });

      if (articles.length > 0) {
        this.logger.debug('Article found with findMany and contains filter');

        // Add is_liked field
        const result = {
          ...articles[0],
          is_liked: userId ? articles[0].likes?.length > 0 : false,
          // If not authenticated user, keep the likes array for display
          ...(userId ? { likes: undefined } : {}),
        };

        return result;
      }

      // As a last resort, get all articles and compare IDs manually
      this.logger.debug(
        'Attempting to find article by loading all and comparing',
      );
      const allArticles = await this.prisma.article.findMany({
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

      // Compare IDs with case-insensitive matching and trimming spaces
      const matchingArticle = allArticles.find(
        (article) =>
          article.id.toLowerCase().trim() === id.toLowerCase().trim(),
      );

      if (matchingArticle) {
        this.logger.debug(
          'Article found with manual case-insensitive comparison',
        );

        // Add is_liked field
        const result = {
          ...matchingArticle,
          is_liked: userId ? matchingArticle.likes?.length > 0 : false,
          // If not authenticated user, keep the likes array for display
          ...(userId ? { likes: undefined } : {}),
        };

        return result;
      }

      // If we still can't find it, throw an error
      throw new NotFoundException(
        'Article not found after multiple lookup attempts',
      );
    } catch (error) {
      this.logger.error(
        `Error in robust article search: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, dto: UpdateArticleDto, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
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

    return { message: 'Article deleted successfully' };
  }

  async like(articleId: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const existingLike = await this.prisma.articleLike.findUnique({
      where: {
        article_id_user_id: {
          article_id: articleId,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.articleLike.delete({
        where: {
          article_id_user_id: {
            article_id: articleId,
            user_id: userId,
          },
        },
      });
      return { message: 'Article unliked successfully' };
    }

    await this.prisma.articleLike.create({
      data: {
        article_id: articleId,
        user_id: userId,
      },
    });

    return { message: 'Article liked successfully' };
  }
}
