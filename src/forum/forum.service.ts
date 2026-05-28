import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ForumStatus } from '@prisma/client';
import { PaginationService } from '../common/services/pagination.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SoftDeleteService } from '../common/services/soft-delete.service';
import { UploadService } from '../upload/upload.service';
import { generateSlug, ensureUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class ForumService extends SoftDeleteService<any> {
  protected model = 'forum';
  protected searchFields = ['title', 'content', 'tags'];

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly paginationService: PaginationService,
    private readonly uploadService: UploadService,
  ) {
    super(prisma, paginationService);
  }

  async create(createForumDto: CreateForumDto, userId: string) {
    // Get the media information
    const media = await this.uploadService.getMediaById(
      createForumDto.media_id,
    );

    // Generate slug from title
    const baseSlug = generateSlug(createForumDto.title);
    const slug = await ensureUniqueSlug(baseSlug, async (slug) => {
      const existingForum = await this.prisma.forum.findUnique({
        where: { slug },
      });
      return !!existingForum;
    });

    return this.prisma.forum.create({
      data: {
        title: createForumDto.title,
        content: createForumDto.content,
        thumbnail: media.url,
        author_id: userId,
        slug,
      },
      include: {
        author: {
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

  async findAll(
    paginationQuery: PaginationQueryDto,
    status?: ForumStatus,
    userId?: string,
  ): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const searchCondition = this.getSearchCondition(paginationQuery.search);

    const [items, totalItems] = await Promise.all([
      this.prisma.forum.findMany({
        where: {
          status: status || ForumStatus.PUBLISHED,
          deletedAt: null,
          ...searchCondition,
        },
        skip,
        take,
        include: {
          author: {
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
              comments: true,
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
      this.prisma.forum.count({
        where: {
          status: status || ForumStatus.PUBLISHED,
          deletedAt: null,
          ...searchCondition,
        },
      }),
    ]);

    // Add is_liked field to each forum
    const enrichedItems = items.map((forum) => ({
      ...forum,
      is_liked: userId ? forum.likes?.length > 0 : false,
      // Remove the likes array as it was only used to determine if_liked
      likes: undefined,
    }));

    return this.paginationService.createPaginationObject(
      enrichedItems,
      totalItems,
      paginationQuery,
    );
  }

  async findMyForums(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<any>> {
    const skip = this.paginationService.getPrismaSkip(paginationQuery);
    const take = this.paginationService.getPrismaLimit(paginationQuery);

    const [items, totalItems] = await Promise.all([
      this.prisma.forum.findMany({
        where: {
          author_id: userId,
          deletedAt: null,
        },
        skip,
        take,
        include: {
          author: {
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
              comments: true,
            },
          },
          likes: {
            where: {
              user_id: userId,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.forum.count({
        where: {
          author_id: userId,
          deletedAt: null,
        },
      }),
    ]);

    // Add is_liked field to each forum
    const enrichedItems = items.map((forum) => ({
      ...forum,
      is_liked: forum.likes?.length > 0,
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
    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        comments: {
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
          orderBy: {
            created_at: 'desc',
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
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
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new NotFoundException('Forum not found or not published');
    }

    // Add is_liked field
    const result = {
      ...forum,
      is_liked: userId ? forum.likes?.length > 0 : false,
      // Remove the likes array as it was only used to determine if_liked
      likes: undefined,
    };

    return result;
  }

  async findOneBySlug(slug: string, userId?: string) {
    const forum = await this.prisma.forum.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        comments: {
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
          orderBy: {
            created_at: 'desc',
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
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
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new NotFoundException('Forum not found or not published');
    }

    // Add is_liked field
    const result = {
      ...forum,
      is_liked: userId ? forum.likes?.length > 0 : false,
      // Remove the likes array as it was only used to determine if_liked
      likes: undefined,
    };

    return result;
  }

  async update(id: string, updateDto: any, userId?: string): Promise<any> {
    return this.updateForum(id, updateDto, userId);
  }

  async updateForum(
    id: string,
    updateForumDto: UpdateForumDto,
    userId: string,
  ) {
    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.author_id !== userId) {
      throw new UnauthorizedException('You can only update your own forums');
    }

    // If media_id is provided, get the media information
    let thumbnailUrl = forum.thumbnail;
    if (updateForumDto.media_id) {
      const media = await this.uploadService.getMediaById(
        updateForumDto.media_id,
      );
      thumbnailUrl = media.url;
    }

    // If title is updated, regenerate the slug
    let slug = forum.slug;
    if (updateForumDto.title && updateForumDto.title !== forum.title) {
      const baseSlug = generateSlug(updateForumDto.title);
      slug = await ensureUniqueSlug(baseSlug, async (s) => {
        const existingForum = await this.prisma.forum.findUnique({
          where: { slug: s },
        });
        return !!existingForum && existingForum.id !== id;
      });
    }

    return this.prisma.forum.update({
      where: {
        id,
      },
      data: {
        title: updateForumDto.title ?? forum.title,
        content: updateForumDto.content ?? forum.content,
        thumbnail: thumbnailUrl,
        slug,
      },
      include: {
        author: {
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

  async updateStatus(id: string, status: ForumStatus) {
    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return this.prisma.forum.update({
      where: { id },
      data: {
        status,
      },
      include: {
        author: {
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

    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.author_id !== userId) {
      throw new UnauthorizedException('You can only delete your own forums');
    }

    await this.prisma.forum.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Forum soft deleted successfully' };
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    return this.removeForum(id, userId);
  }

  async removeForum(id: string, userId: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.author_id !== userId) {
      throw new UnauthorizedException('You can only delete your own forums');
    }

    await this.prisma.forum.delete({
      where: { id },
    });

    return { message: 'Forum permanently deleted successfully' };
  }

  async restore(id: string, userId?: string): Promise<{ message: string }> {
    if (!userId) {
      return super.restore(id);
    }

    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!forum) {
      throw new NotFoundException('Deleted forum not found');
    }

    if (forum.author_id !== userId) {
      throw new UnauthorizedException('You can only restore your own forums');
    }

    await this.prisma.forum.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return { message: 'Forum restored successfully' };
  }

  async like(id: string, userId: string) {
    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new NotFoundException('Forum not found or not published');
    }

    // Check if the user has already liked the forum
    const existingLike = await this.prisma.forumLike.findUnique({
      where: {
        forum_id_user_id: {
          forum_id: id,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      // If like exists, remove it (unlike)
      await this.prisma.forumLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    } else {
      // If like doesn't exist, create it (like)
      await this.prisma.forumLike.create({
        data: {
          forum_id: id,
          user_id: userId,
        },
      });
      return { liked: true };
    }
  }

  async comment(id: string, comment: string, userId: string) {
    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new NotFoundException('Forum not found or not published');
    }

    const newComment = await this.prisma.forumComment.create({
      data: {
        forum_id: id,
        user_id: userId,
        comments: comment,
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

    return newComment;
  }

  async unpublish(id: string) {
    const forum = await this.prisma.forum.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return this.prisma.forum.update({
      where: { id },
      data: {
        status: ForumStatus.DRAFT,
      },
      include: {
        author: {
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
}
