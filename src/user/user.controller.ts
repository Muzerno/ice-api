import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';

import { UserService } from './user.service';
import { IUpdateUser, ReqCreateUser } from './validator/validator';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  @Get('/:id')
  async findOne(@Param() id: number) {
    try {
      const user = await this.userService.findOne(id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post()
  async createUser(@Body() body: ReqCreateUser, @Res() res: Response) {
    try {
      const user = await this.userService.createUser(body);
      if (user.success === true) {
        res.status(HttpStatus.OK).json({
          success: true,
          message: 'Create User Success',
        });
      } else {
        res.status(HttpStatus.NO_CONTENT).json({
          success: false,
          message: 'Create User Failed',
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Create User Failed',
        stack: error.stack,
      });
    }
  }

  @Put('/:id')
  async updateUser(
    @Param('id') id,
    @Body() body: IUpdateUser,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.updateUser(id, body);
      if (user.success === true) {
        res.status(HttpStatus.OK).json({
          success: true,
          message: 'Update User Success',
        });
        return;
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: user.message || 'Update User Failed',
        });
        return;
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Update User Failed',
        stack: error.stack,
      });
    }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id) {
    try {
      await this.userService.deleteUser(id);
      return {
        success: true,
        message: 'Delete User Success',
      };
    } catch (error) {
      // ตรวจจับ Foreign Key constraint ของ MySQL
      if (error.message.includes('a foreign key constraint fails')) {
        return {
          success: false,
          message:
            'ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีข้อมูลรถที่เชื่อมโยงอยู่',
          errorCode: 'FK_USER_CAR',
        };
      }

      // error อื่น ๆ ทั่วไป
      return {
        success: false,
        message: 'Delete User Failed',
        stack: error.stack,
      };
    }
  }

  @Get('/deliver')
  async findDeliverUsers() {
    try {
      const users = await this.userService.findDeliverUsers();
      console.log('user', users);
      return { success: true, data: users };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to find deliver users',
        stack: error.stack,
      };
    }
  }
}