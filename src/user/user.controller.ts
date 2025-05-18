import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  Query,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { BaseResponse } from '../common/interfaces/base-response.interface';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly paginationService: PaginationService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    // For safe pagination without modifying the service method that might be called by other code
    const users = await this.userService.findAll(paginationQuery);
    return users;
  }

  @Get('deleted')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAllDeleted(@Query() paginationQuery: PaginationQueryDto) {
    return this.userService.findAllDeleted(paginationQuery);
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user) {
    return user;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user,
  ) {
    // Allow users to update their own profile or admins to update any profile
    if (
      user.id !== id &&
      user.role !== Role.ADMIN &&
      user.role !== Role.SUPER_ADMIN
    ) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id/soft')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  softRemove(@Param('id') id: string) {
    return this.userService.softRemove(id);
  }

  @Delete(':id/permanent')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseResponse> {
    try {
      // Extract the token from cookies
      const token = req.cookies['auth_token'];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify the current token without checking expiration
      let payload;
      try {
        payload = this.jwtService.verify(token, { ignoreExpiration: true });
      } catch (_) {
        throw new UnauthorizedException('Invalid token');
      }

      // Find the user
      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate a new token
      const newToken = this.jwtService.sign({ sub: user.id });

      // Set the new token in cookies
      res.cookie('auth_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return {
        status: true,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      // Use the error message in the thrown exception
      const errorMessage =
        error instanceof Error ? error.message : 'Token refresh failed';
      throw new UnauthorizedException(errorMessage);
    }
  }
}
