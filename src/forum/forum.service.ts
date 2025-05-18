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

@Injectable()
export class ForumService extends SoftDeleteService<any> {
  protected model = 'forum';

  constructor(
    protected prisma: PrismaService,
    protected paginationService: PaginationService,
  ) {
    super(prisma, paginationService);
  }

  async create(createForumDto: CreateForumDto, userId: string) {
    return this.prisma.forum.create({
      data: {
        ...createForumDto,
        author_id: userId,
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

    const [items, totalItems] = await Promise.all([
      this.prisma.forum.findMany({
        where: {
          status: status || ForumStatus.PUBLISHED,
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

  async update(id: string, updateForumDto: UpdateForumDto, userId: string) {
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

    if (forum.status === ForumStatus.PUBLISHED) {
      throw new UnauthorizedException('Cannot update published forums');
    }

    return this.prisma.forum.update({
      where: { id },
      data: updateForumDto,
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

  async updateStatus(id: string, status: ForumStatus, adminId: string) {
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

  async remove(id: string, userId: string) {
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
}
