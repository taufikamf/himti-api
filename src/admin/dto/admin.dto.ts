import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, ForumStatus } from '@prisma/client';

// User DTOs
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  profile_picture?: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  profile_picture?: string;
}

// Forum DTOs
export class CreateForumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;
}

export class UpdateForumDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsEnum(ForumStatus)
  @IsOptional()
  status?: ForumStatus;
}

// Article DTOs
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  author: string;
}

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  author?: string;
}

// Department DTOs
export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  department: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  department?: string;
}

// Division DTOs
export class CreateDivisionDto {
  @IsString()
  @IsNotEmpty()
  division: string;

  @IsString()
  @IsOptional()
  department_id?: string;
}

export class UpdateDivisionDto {
  @IsString()
  @IsOptional()
  division?: string;

  @IsString()
  @IsOptional()
  department_id?: string;
}

// Member DTOs
export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsOptional()
  division_id?: string;

  @IsString()
  @IsOptional()
  photo?: string;
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  division_id?: string;

  @IsString()
  @IsOptional()
  photo?: string;
}

// Event DTOs
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;
}

// Gallery DTOs
export class CreateGalleryDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  photo_url: string;
}

export class UpdateGalleryDto {
  @IsString()
  @IsOptional()
  event_id?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;
}

// Bank Data DTOs
export class CreateBankDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}

export class UpdateBankDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  link?: string;
} 