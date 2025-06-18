import { Injectable, Logger } from '@nestjs/common';
import { ICreateUser, IUpdateUser } from './validator/validator';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) { }

  async createUser(body: ICreateUser) {
    try {
      const user = await this.UserRepository.findOne({
        where: { username: body.username },
      });
      if (user) {
        return { success: false, message: 'Username is already exist' };
      } else {
        await this.UserRepository.createQueryBuilder('user')
          .insert()
          .values({
            username: body.username,
            password: body.password ?? '123456',
            telephone: body.telephone,
            firstname: body.firstname,
            lastname: body.lastname,
            role: { id: body.role_id },
            address: body.address,
          })
          .execute();
      }
      return { success: true, message: 'User created successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll() {
    try {
      return await this.UserRepository.find({ relations: ['role'] });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateUser(id: number, body: IUpdateUser) {
    try {
      // สร้าง object สำหรับการอัปเดตข้อมูลผู้ใช้
      const updateData: any = {};

      // เพิ่มข้อมูลเฉพาะฟิลด์ที่ส่งมา
      if (body.username !== undefined) updateData.username = body.username;
      if (body.password !== undefined) updateData.password = body.password;
      if (body.telephone !== undefined) updateData.telephone = body.telephone;
      if (body.firstname !== undefined) updateData.firstname = body.firstname;
      if (body.lastname !== undefined) updateData.lastname = body.lastname;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.role_id !== undefined) updateData.role = { id: body.role_id };

      // ถ้าไม่มีข้อมูลให้อัปเดต
      if (Object.keys(updateData).length === 0) {
        return { success: false, message: 'No data provided for update' };
      }

      // ดำเนินการอัปเดตข้อมูล
      const result = await this.UserRepository.createQueryBuilder('user')
        .update()
        .set(updateData)
        .where({
          id: id,
        })
        .execute();

      // ตรวจสอบว่ามีการอัปเดตข้อมูลจริงหรือไม่
      if (result.affected > 0) {
        return { success: true, message: 'User updated successfully' };
      } else {
        return {
          success: false,
          message: 'User not found or no changes applied',
        };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteUser(id: number) {
    try {
      await this.UserRepository.delete(id);
      return;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.UserRepository.findOne({ where: { id: id } });

      return user;
    } catch (error) { }
  }

  async getUserByUsername(username: string) {
    try {
      if (username) {
        const user = await this.UserRepository.findOne({
          where: { username: username },
          relations: ['role', 'transportation_car'],
        });
        return user;
      }
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async validatePassword(username: string, password: string) {
    try {
      const user = await this.UserRepository.findOne({
        where: { username: username, password: password },
      });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findDeliverUsers() {
    try {
      const res = await this.UserRepository.find({
        where: { role: { role_key: 'deliver' } },
        relations: ['role'],
      });
      this.logger.log('res', res);
      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  
}
