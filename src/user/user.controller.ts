import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';

import { UserService } from './user.service';
import { IUpdateUser, ReqCreateUser } from './validator/validator';


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

  @Get('/:id')
  async findOne(@Param() id: number) {
    try {
      const user = await this.userService.findOne(id);
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


  @Put('/:id')
  async updateUser(@Param('id') id, @Body() body: IUpdateUser) {
    try {
      await this.userService.updateUser(id, body)
      return {
        success: true, message: "Update User Success"
      }
    } catch (error) {
      return {
        success: false, message: "Update User Failed", stack: error.stack
      }
    }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id) {
    try {
      await this.userService.deleteUser(id)
      return {
        success: true, message: "Delete User Success"
      }
    } catch (error) {
      return {
        success: false, message: "Delete User Failed", stack: error.stack
      }
    }
  }

  @Get('/deliver')
  async findDeliverUsers() {
    try {
      const users = await this.userService.findDeliverUsers();
      console.log("user", users)
      return { success: true, data: users };
    } catch (error) {
      return { success: false, message: "Failed to find deliver users", stack: error.stack };
    }
  }

}
