import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';
import { ICreateRole } from './validator/validator';


@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) { }

    async createRole(body: ICreateRole) {
        try {

            await this.roleRepository.createQueryBuilder('role').insert()
                .values({
                    role_name: body.role_name,
                    role_key: body.role_key
                })
                .execute();
            return { success: true, message: 'Create Role Success' };
        } catch (error) {
            return { success: false, message: 'Create Role Failed', stack: error.stack };
        }
    }

    async getAllRoles() {
        return this.roleRepository.find();
    }

    async getRoleByUUID(id: number) {
        return this.roleRepository.findOne({ where: { id: id } });
    }

    async updateRole(id: number, body: ICreateRole) {
        try {
            await this.roleRepository.createQueryBuilder('role').update().set({ role_name: body.role_name }).where('id = :id', { id }).execute();
            return { success: true, message: 'Update Role Success' };
        } catch (error) {
            return { success: false, message: 'Update Role Failed', stack: error.stack };
        }
    }

    async deleteRole(id: number) {
        try {
            await this.roleRepository.createQueryBuilder('role').delete().where('id = :id', { id }).execute();
            return { success: true, message: 'Delete Role Success' };
        } catch (error) {
            return { success: false, message: 'Delete Role Failed', stack: error.stack };
        }
    }
}