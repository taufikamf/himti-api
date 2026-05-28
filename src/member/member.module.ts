import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CommonModule } from '../common/common.module';
import { MemberAdminController } from './member-admin.controller';

@Module({
  imports: [CommonModule],
  controllers: [MemberController, MemberAdminController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {} 