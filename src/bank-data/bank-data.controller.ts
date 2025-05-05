import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BankDataService } from './bank-data.service';
import { CreateBankDataDto } from './dto/create-bank-data.dto';
import { UpdateBankDataDto } from './dto/update-bank-data.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('bank-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankDataController {
  constructor(private readonly bankDataService: BankDataService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createBankDataDto: CreateBankDataDto) {
    return this.bankDataService.create(createBankDataDto);
  }

  @Get()
  findAll() {
    return this.bankDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankDataService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateBankDataDto: UpdateBankDataDto) {
    return this.bankDataService.update(id, updateBankDataDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.bankDataService.remove(id);
  }
} 