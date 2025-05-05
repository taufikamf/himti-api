import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ForumStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { 
  CreateUserDto, 
  UpdateUserDto,
  CreateForumDto,
  UpdateForumDto,
  CreateArticleDto,
  UpdateArticleDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateDivisionDto,
  UpdateDivisionDto,
  CreateMemberDto,
  UpdateMemberDto,
  CreateEventDto,
  UpdateEventDto,
  CreateGalleryDto,
  UpdateGalleryDto,
  CreateBankDataDto,
  UpdateBankDataDto
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // User Management
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async createSuperAdmin(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: Role.SUPER_ADMIN,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || Role.USER,
        profile_picture: dto.profile_picture,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await this.hashPassword(dto.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
        profile_picture: dto.profile_picture,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Cannot delete super admin user');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  // Forum Management
  async createForum(dto: CreateForumDto, adminId: string) {
    return this.prisma.forum.create({
      data: {
        title: dto.title,
        content: dto.content,
        thumbnail: dto.thumbnail,
        author_id: adminId,
        status: ForumStatus.PUBLISHED,
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

  async findAllForums() {
    return this.prisma.forum.findMany({
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

  async findForumById(id: string) {
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

    return forum;
  }

  async updateForum(id: string, dto: UpdateForumDto) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return this.prisma.forum.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        thumbnail: dto.thumbnail,
        status: dto.status,
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

  async deleteForum(id: string) {
    const forum = await this.prisma.forum.findUnique({
      where: { id },
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    await this.prisma.forum.delete({
      where: { id },
    });

    return { message: 'Forum deleted successfully' };
  }

  // Article Management
  async createArticle(dto: CreateArticleDto, adminId: string) {
    return this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        thumbnail: dto.thumbnail,
        author: dto.author,
        author_id: adminId,
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

  async findAllArticles() {
    return this.prisma.article.findMany({
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
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findArticleById(id: string) {
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

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
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

  async deleteArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }

  // Department Management
  async createDepartment(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        department: dto.department,
      },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async findAllDepartments() {
    return this.prisma.department.findMany({
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async findDepartmentById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        department: dto.department,
      },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async deleteDepartment(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { message: 'Department deleted successfully' };
  }

  // Division Management
  async createDivision(dto: CreateDivisionDto) {
    return this.prisma.division.create({
      data: {
        division: dto.division,
        department_id: dto.department_id,
      },
      include: {
        department: true,
        members: true,
      },
    });
  }

  async findAllDivisions() {
    return this.prisma.division.findMany({
      include: {
        department: true,
        members: true,
      },
    });
  }

  async findDivisionById(id: string) {
    const division = await this.prisma.division.findUnique({
      where: { id },
      include: {
        department: true,
        members: true,
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return division;
  }

  async updateDivision(id: string, dto: UpdateDivisionDto) {
    const division = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return this.prisma.division.update({
      where: { id },
      data: {
        division: dto.division,
        department_id: dto.department_id,
      },
      include: {
        department: true,
        members: true,
      },
    });
  }

  async deleteDivision(id: string) {
    const division = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    await this.prisma.division.delete({
      where: { id },
    });

    return { message: 'Division deleted successfully' };
  }

  // Member Management
  async createMember(dto: CreateMemberDto) {
    return this.prisma.member.create({
      data: {
        name: dto.name,
        position: dto.position,
        photo: dto.photo,
        division_id: dto.division_id,
      },
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  async findAllMembers() {
    return this.prisma.member.findMany({
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  async findMemberById(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async updateMember(id: string, dto: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.member.update({
      where: { id },
      data: {
        name: dto.name,
        position: dto.position,
        photo: dto.photo,
        division_id: dto.division_id,
      },
      include: {
        division: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  async deleteMember(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.member.delete({
      where: { id },
    });

    return { message: 'Member deleted successfully' };
  }

  // Event Management
  async createEvent(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
      },
      include: {
        gallery: true,
      },
    });
  }

  async findAllEvents() {
    return this.prisma.event.findMany({
      include: {
        gallery: true,
      },
    });
  }

  async findEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        gallery: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async updateEvent(id: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        name: dto.name,
      },
      include: {
        gallery: true,
      },
    });
  }

  async deleteEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  // Gallery Management
  async createGallery(dto: CreateGalleryDto) {
    return this.prisma.gallery.create({
      data: {
        event_id: dto.event_id,
        photo_url: dto.photo_url,
      },
      include: {
        event: true,
      },
    });
  }

  async findAllGalleries() {
    return this.prisma.gallery.findMany({
      include: {
        event: true,
      },
    });
  }

  async findGalleryById(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return gallery;
  }

  async updateGallery(id: string, dto: UpdateGalleryDto) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return this.prisma.gallery.update({
      where: { id },
      data: {
        event_id: dto.event_id,
        photo_url: dto.photo_url,
      },
      include: {
        event: true,
      },
    });
  }

  async deleteGallery(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    await this.prisma.gallery.delete({
      where: { id },
    });

    return { message: 'Gallery deleted successfully' };
  }

  // Bank Data Management
  async createBankData(dto: CreateBankDataDto) {
    return this.prisma.bankData.create({
      data: {
        title: dto.title,
        link: dto.link,
      },
    });
  }

  async findAllBankData() {
    return this.prisma.bankData.findMany();
  }

  async findBankDataById(id: string) {
    const bankData = await this.prisma.bankData.findUnique({
      where: { id },
    });

    if (!bankData) {
      throw new NotFoundException('Bank data not found');
    }

    return bankData;
  }

  async updateBankData(id: string, dto: UpdateBankDataDto) {
    const bankData = await this.prisma.bankData.findUnique({
      where: { id },
    });

    if (!bankData) {
      throw new NotFoundException('Bank data not found');
    }

    return this.prisma.bankData.update({
      where: { id },
      data: {
        title: dto.title,
        link: dto.link,
      },
    });
  }

  async deleteBankData(id: string) {
    const bankData = await this.prisma.bankData.findUnique({
      where: { id },
    });

    if (!bankData) {
      throw new NotFoundException('Bank data not found');
    }

    await this.prisma.bankData.delete({
      where: { id },
    });

    return { message: 'Bank data deleted successfully' };
  }
} 