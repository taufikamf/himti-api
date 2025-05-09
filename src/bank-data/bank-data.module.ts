import { Module } from '@nestjs/common';
import { BankDataController } from './bank-data.controller';
import { BankDataService } from './bank-data.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [BankDataController],
  providers: [BankDataService],
  exports: [BankDataService],
})
export class BankDataModule {} 