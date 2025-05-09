import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum MemberRole {
  LEAD = 'LEAD',
  SECRETARY = 'SECRETARY',
  STAFF = 'STAFF',
}

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
  
  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;
} 