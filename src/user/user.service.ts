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
      await this.UserRepository.createQueryBuilder('user')
        .insert()
        .values({
          username: body.username,
          password: body.password ?? "123456",
          telephone: body.telephone,
          name: body.name,
          create_at: new Date(),
          role: { uuid: body.role_uuid }
        })
        .execute()
      return;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findAll() {
    try {
      return await this.UserRepository.find({ where: { status: "active" }, relations: ["role"] });
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateUser(uuid: string, body: IUpdateUser) {
    try {
      await this.UserRepository.createQueryBuilder('user')
        .update()
        .set({
          username: body.username,
          password: body.password,
          telephone: body.telephone,
          name: body.name,
          update_at: new Date(),
          role: { uuid: body.role_uuid }
        })
        .where({
          uuid: uuid
        })
        .execute()
      return;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteUser(uuid: string) {
    try {
      await this.UserRepository.createQueryBuilder('user')
        .update()
        .set({
          status: "archived",
          archive_at: new Date(),
        })
        .where({
          uuid: uuid
        })
        .execute()
      return;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findOne(uuid: UUID) {
    try {
      const user = await this.UserRepository.findOne({ where: { uuid: uuid } })

      return user;
    } catch (error) {

    }
  }


  async getUserByUsername(username: string) {
    try {
      const user = await this.UserRepository.findOne({ where: { username: username, status: "active" }, relations: ["role"] })
      return user
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
