import { Controller, Get, Param } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}