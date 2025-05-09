import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ForumStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ForumQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Forum status filter',
    required: false,
    enum: ForumStatus,
  })
  @IsOptional()
  @IsEnum(ForumStatus)
  status?: ForumStatus;
} 