import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MemberModule } from './member/member.module';
import { DepartmentModule } from './department/department.module';
import { DivisionModule } from './division/division.module';
import { EventModule } from './event/event.module';
import { GalleryModule } from './gallery/gallery.module';
import { ForumModule } from './forum/forum.module';
import { ArticleModule } from './article/article.module';
import { BankDataModule } from './bank-data/bank-data.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { CommonModule } from './common/common.module';
import { UploadModule } from './upload/upload.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    MemberModule,
    DepartmentModule,
    DivisionModule,
    EventModule,
    GalleryModule,
    ForumModule,
    ArticleModule,
    BankDataModule,
    AdminModule,
    MailModule,
    CommonModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/api/v1/auth(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
