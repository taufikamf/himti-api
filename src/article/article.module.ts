import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CommonModule } from '../common/common.module';
import { ArticleAdminController } from './article-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [CommonModule, PrismaModule, UploadModule],
  controllers: [ArticleController, ArticleAdminController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
