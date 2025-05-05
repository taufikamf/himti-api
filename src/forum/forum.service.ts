import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ForumStatus } from '@prisma/client';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

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

  async findAll(status?: ForumStatus) {
    return this.prisma.forum.findMany({
      where: {
        status: status || ForumStatus.PUBLISHED,
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findMyForums(userId: string) {
    return this.prisma.forum.findMany({
      where: {
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new NotFoundException('Forum not found or not published');
    }

    return forum;
  }

  async update(id: string, updateForumDto: UpdateForumDto, userId: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
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
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return this.prisma.forum.update({
      where: { id },
      data: { status },
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

    return this.prisma.forum.delete({
      where: { id },
    });
  }

  async like(id: string, userId: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new UnauthorizedException('Can only like published forums');
    }

    const existingLike = await this.prisma.forumLike.findUnique({
      where: {
        forum_id_user_id: {
          forum_id: id,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.forumLike.delete({
        where: {
          forum_id_user_id: {
            forum_id: id,
            user_id: userId,
          },
        },
      });
      return { message: 'Forum unliked successfully' };
    }

    await this.prisma.forumLike.create({
      data: {
        forum_id: id,
        user_id: userId,
      },
    });

    return { message: 'Forum liked successfully' };
  }

  async comment(id: string, comment: string, userId: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.status !== ForumStatus.PUBLISHED) {
      throw new UnauthorizedException('Can only comment on published forums');
    }

    return this.prisma.forumComment.create({
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
  }
} 