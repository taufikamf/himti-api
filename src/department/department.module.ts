import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { CommonModule } from '../common/common.module';
import { DepartmentAdminController } from './department-admin.controller';

@Module({
  imports: [CommonModule],
  controllers: [DepartmentController, DepartmentAdminController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {} 