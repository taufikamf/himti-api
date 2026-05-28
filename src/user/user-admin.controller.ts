import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { BaseAdminController } from '../common/controllers/base-admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin/users')
@UseGuards(RolesGuard)
export class UserAdminController extends BaseAdminController<any> {
  constructor(private readonly userService: UserService) {
    super(userService, 'user');
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createUserDto: any) {
    return this.userService.create(createUserDto);
  }

  // Override if you need specific behavior different from the base controller
  // For example, if user updates need special handling:
  /*
  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
  */
} 