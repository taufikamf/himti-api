import { Module } from '@nestjs/common';
import { DivisionController } from './division.controller';
import { DivisionService } from './division.service';
import { CommonModule } from '../common/common.module';
import { DivisionAdminController } from './division-admin.controller';

@Module({
  imports: [CommonModule],
  controllers: [DivisionController, DivisionAdminController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {} 