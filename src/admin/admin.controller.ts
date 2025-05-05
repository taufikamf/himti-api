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
import { AdminService } from './admin.service';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateForumDto,
  UpdateForumDto,
  CreateArticleDto,
  UpdateArticleDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateDivisionDto,
  UpdateDivisionDto,
  CreateMemberDto,
  UpdateMemberDto,
  CreateEventDto,
  UpdateEventDto,
  CreateGalleryDto,
  UpdateGalleryDto,
  CreateBankDataDto,
  UpdateBankDataDto,
} from './dto/admin.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Management
  @Post('users/super-admin')
  @Roles(Role.SUPER_ADMIN)
  createSuperAdmin(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createSuperAdmin(createUserDto);
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string) {
    return this.adminService.findUserById(id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Forum Management
  @Post('forums')
  createForum(@Body() createForumDto: CreateForumDto, @CurrentUser() user) {
    return this.adminService.createForum(createForumDto, user.id);
  }

  @Get('forums')
  findAllForums() {
    return this.adminService.findAllForums();
  }

  @Get('forums/:id')
  findForumById(@Param('id') id: string) {
    return this.adminService.findForumById(id);
  }

  @Patch('forums/:id')
  updateForum(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
  ) {
    return this.adminService.updateForum(id, updateForumDto);
  }

  @Delete('forums/:id')
  deleteForum(@Param('id') id: string) {
    return this.adminService.deleteForum(id);
  }

  // Article Management
  @Post('articles')
  createArticle(@Body() createArticleDto: CreateArticleDto, @CurrentUser() user) {
    return this.adminService.createArticle(createArticleDto, user.id);
  }

  @Get('articles')
  findAllArticles() {
    return this.adminService.findAllArticles();
  }

  @Get('articles/:id')
  findArticleById(@Param('id') id: string) {
    return this.adminService.findArticleById(id);
  }

  @Patch('articles/:id')
  updateArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.adminService.updateArticle(id, updateArticleDto);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.adminService.deleteArticle(id);
  }

  // Department Management
  @Post('departments')
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.adminService.createDepartment(createDepartmentDto);
  }

  @Get('departments')
  findAllDepartments() {
    return this.adminService.findAllDepartments();
  }

  @Get('departments/:id')
  findDepartmentById(@Param('id') id: string) {
    return this.adminService.findDepartmentById(id);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.adminService.updateDepartment(id, updateDepartmentDto);
  }

  @Delete('departments/:id')
  deleteDepartment(@Param('id') id: string) {
    return this.adminService.deleteDepartment(id);
  }

  // Division Management
  @Post('divisions')
  createDivision(@Body() createDivisionDto: CreateDivisionDto) {
    return this.adminService.createDivision(createDivisionDto);
  }

  @Get('divisions')
  findAllDivisions() {
    return this.adminService.findAllDivisions();
  }

  @Get('divisions/:id')
  findDivisionById(@Param('id') id: string) {
    return this.adminService.findDivisionById(id);
  }

  @Patch('divisions/:id')
  updateDivision(
    @Param('id') id: string,
    @Body() updateDivisionDto: UpdateDivisionDto,
  ) {
    return this.adminService.updateDivision(id, updateDivisionDto);
  }

  @Delete('divisions/:id')
  deleteDivision(@Param('id') id: string) {
    return this.adminService.deleteDivision(id);
  }

  // Member Management
  @Post('members')
  createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.adminService.createMember(createMemberDto);
  }

  @Get('members')
  findAllMembers() {
    return this.adminService.findAllMembers();
  }

  @Get('members/:id')
  findMemberById(@Param('id') id: string) {
    return this.adminService.findMemberById(id);
  }

  @Patch('members/:id')
  updateMember(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.adminService.updateMember(id, updateMemberDto);
  }

  @Delete('members/:id')
  deleteMember(@Param('id') id: string) {
    return this.adminService.deleteMember(id);
  }

  // Event Management
  @Post('events')
  createEvent(@Body() createEventDto: CreateEventDto) {
    return this.adminService.createEvent(createEventDto);
  }

  @Get('events')
  findAllEvents() {
    return this.adminService.findAllEvents();
  }

  @Get('events/:id')
  findEventById(@Param('id') id: string) {
    return this.adminService.findEventById(id);
  }

  @Patch('events/:id')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.adminService.updateEvent(id, updateEventDto);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string) {
    return this.adminService.deleteEvent(id);
  }

  // Gallery Management
  @Post('galleries')
  createGallery(@Body() createGalleryDto: CreateGalleryDto) {
    return this.adminService.createGallery(createGalleryDto);
  }

  @Get('galleries')
  findAllGalleries() {
    return this.adminService.findAllGalleries();
  }

  @Get('galleries/:id')
  findGalleryById(@Param('id') id: string) {
    return this.adminService.findGalleryById(id);
  }

  @Patch('galleries/:id')
  updateGallery(
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    return this.adminService.updateGallery(id, updateGalleryDto);
  }

  @Delete('galleries/:id')
  deleteGallery(@Param('id') id: string) {
    return this.adminService.deleteGallery(id);
  }

  // Bank Data Management
  @Post('bank-data')
  createBankData(@Body() createBankDataDto: CreateBankDataDto) {
    return this.adminService.createBankData(createBankDataDto);
  }

  @Get('bank-data')
  findAllBankData() {
    return this.adminService.findAllBankData();
  }

  @Get('bank-data/:id')
  findBankDataById(@Param('id') id: string) {
    return this.adminService.findBankDataById(id);
  }

  @Patch('bank-data/:id')
  updateBankData(
    @Param('id') id: string,
    @Body() updateBankDataDto: UpdateBankDataDto,
  ) {
    return this.adminService.updateBankData(id, updateBankDataDto);
  }

  @Delete('bank-data/:id')
  deleteBankData(@Param('id') id: string) {
    return this.adminService.deleteBankData(id);
  }
} 