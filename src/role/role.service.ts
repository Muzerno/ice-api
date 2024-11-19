import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';
import { ICreateRole } from './validator/validator';
import { UUID } from 'uuid';

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
                    create_at: new Date(),
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

    async getRoleByUUID(uuid: UUID) {
        return this.roleRepository.findOne({ where: { uuid } });
    }

    async updateRole(uuid: UUID, body: ICreateRole) {
        try {
            await this.roleRepository.createQueryBuilder('role').update().set({ role_name: body.role_name }).where('uuid = :uuid', { uuid }).execute();
            return { success: true, message: 'Update Role Success' };
        } catch (error) {
            return { success: false, message: 'Update Role Failed', stack: error.stack };
        }
    }

    async deleteRole(uuid: UUID) {
        try {
            await this.roleRepository.createQueryBuilder('role').delete().where('uuid = :uuid', { uuid }).execute();
            return { success: true, message: 'Delete Role Success' };
        } catch (error) {
            return { success: false, message: 'Delete Role Failed', stack: error.stack };
        }
    }
}