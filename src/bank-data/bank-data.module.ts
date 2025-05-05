import { Module } from '@nestjs/common';
import { BankDataController } from './bank-data.controller';
import { BankDataService } from './bank-data.service';

@Module({
  controllers: [BankDataController],
  providers: [BankDataService],
  exports: [BankDataService],
})
export class BankDataModule {} 