import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBankDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  link: string;
} 