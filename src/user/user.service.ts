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
    private UserRepository: Repository<User>
  ) { }

  async createUser(body: ICreateUser) {
    try {

      const user = await this.UserRepository.findOne({ where: { username: body.username } })
      if (user) {
        return { success: false, message: "Username is already exist" }
      } else {
        await this.UserRepository.createQueryBuilder('user')
          .insert()
          .values({
            username: body.username,
            password: body.password ?? "123456",
            telephone: body.telephone,
            firstname: body.firstname,
            lastname: body.lastname,
            role: { id: body.role_id },
            address: body.address
          })
          .execute()
      }
      return { success: true, message: "User created successfully" };
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findAll() {
    try {
      return await this.UserRepository.find({ relations: ["role"] });
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateUser(id: number, body: IUpdateUser) {
    try {

      const user = await this.UserRepository.findOne({ where: { username: body.username } })

      if (user) {
        return { success: false, message: "Username is already exist" }
      } else {
        await this.UserRepository.createQueryBuilder('user')
          .update()
          .set({
            username: body.username,
            password: body.password,
            telephone: body.telephone,
            firstname: body.firstname,
            lastname: body.lastname,
            role: { id: body.role_id }
          })
          .where({
            id: id
          })
          .execute()
        return { success: true, message: "User updated successfully" };
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteUser(id: number) {
    try {
      await this.UserRepository.delete(id)
      return;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.UserRepository.findOne({ where: { id: id } })

      return user;
    } catch (error) {

    }
  }


  async getUserByUsername(username: string) {
    try {
      if (username) {
        const user = await this.UserRepository.findOne({ where: { username: username }, relations: ["role", "transportation_car"] })
        return user
      }
      return null
    } catch (error) {
      throw new Error(error.message)
    }

  }

  async validatePassword(username: string, password: string) {
    try {
      const user = await this.UserRepository.findOne({ where: { username: username, password: password } })
      return user;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findDeliverUsers() {
    try {
      const res = await this.UserRepository.find({
        where: { role: { role_key: "deliver" } },
        relations: ["role"],
      });
      this.logger.log("res", res)
      return res
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
