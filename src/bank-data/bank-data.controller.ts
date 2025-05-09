import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BankDataService } from './bank-data.service';
import { CreateBankDataDto } from './dto/create-bank-data.dto';
import { UpdateBankDataDto } from './dto/update-bank-data.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Controller('bank-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankDataController {
  constructor(
    private readonly bankDataService: BankDataService,
    private readonly paginationService: PaginationService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() createBankDataDto: CreateBankDataDto) {
    return this.bankDataService.create(createBankDataDto);
  }

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    // For safe pagination without modifying the service method that might be called by other code
    const bankData = await this.bankDataService.findAll(paginationQuery);
    return bankData;
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