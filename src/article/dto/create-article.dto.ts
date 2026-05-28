import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  media_id: string;

  @IsString()
  @IsNotEmpty()
  author: string;
}
