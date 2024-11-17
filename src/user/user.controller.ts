import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';

import { UserService } from './user.service';
import { IUpdateUser, ReqCreateUser } from './validator/validator';
import { Response } from 'express';
import { UUID } from 'crypto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return {
      success: true,
      data: users
    }
  }

  @Get('/:uuid')
  async findOne(@Param() uuid: UUID) {
    try {
      const user = await this.userService.findOne(uuid);
      return {
        success: true, data: user
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  @Post()
  async createUser(@Body() body: ReqCreateUser) {
    try {
      await this.userService.createUser(body)
      return {
        success: true, message: "Create User Success"
      }
    } catch (error) {
      return {
        success: false, message: "Create User Failed", stack: error.stack
      }
    }
  }


  @Put('/:uuid')
  async updateUser(@Param('uuid') uuid, @Body() body: IUpdateUser) {
    try {
      await this.userService.updateUser(uuid, body)
      return {
        success: true, message: "Update User Success"
      }
    } catch (error) {
      return {
        success: false, message: "Update User Failed", stack: error.stack
      }
    }
  }

  @Delete('/:uuid')
  async deleteUser(@Param('uuid') uuid) {
    try {
      await this.userService.deleteUser(uuid)
      return {
        success: true, message: "Delete User Success"
      }
    } catch (error) {
      return {
        success: false, message: "Delete User Failed", stack: error.stack
      }
    }
  }
}
