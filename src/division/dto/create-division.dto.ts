import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDivisionDto {
  @IsString()
  @IsNotEmpty()
  division: string;

  @IsString()
  @IsOptional()
  department_id?: string;
} 