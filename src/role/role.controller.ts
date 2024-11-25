import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { RoleService } from './role.service';
import { ICreateRole } from './validator/validator';


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

  @Get(':id')
  async getRoleByUUID(@Param('id') id: number) {
    return this.roleService.getRoleByUUID(id);
  }

  @Put(':id')
  async updateRole(@Param('id') id: number, @Body() body: ICreateRole) {
    return this.roleService.updateRole(id, body);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    return this.roleService.deleteRole(id);
  }
}