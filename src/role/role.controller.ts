import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { RoleService } from './role.service';
import { ICreateRole } from './validator/validator';
import { UUID } from 'uuid';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  async createRole(@Body() body: ICreateRole) {
    return this.roleService.createRole(body);
  }

  @Get()
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Get(':uuid')
  async getRoleByUUID(@Param('uuid') uuid: UUID) {
    return this.roleService.getRoleByUUID(uuid);
  }

  @Put(':uuid')
  async updateRole(@Param('uuid') uuid: UUID, @Body() body: ICreateRole) {
    return this.roleService.updateRole(uuid, body);
  }

  @Delete(':uuid')
  async deleteRole(@Param('uuid') uuid: UUID) {
    return this.roleService.deleteRole(uuid);
  }
}