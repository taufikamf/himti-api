import { Module } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { CommonModule } from '../common/common.module';
import { ForumAdminController } from './forum-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [CommonModule, PrismaModule, UploadModule],
  controllers: [ForumController, ForumAdminController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
