import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../config/jwt.config';
import { UserAdminController } from './user-admin.controller';

@Module({
  imports: [
    CommonModule,
    JwtModule.registerAsync(jwtConfig)
  ],
  controllers: [UserController, UserAdminController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
