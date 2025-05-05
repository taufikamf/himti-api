import { PartialType } from '@nestjs/mapped-types';
import { CreateBankDataDto } from './create-bank-data.dto';

export class UpdateBankDataDto extends PartialType(CreateBankDataDto) {} 