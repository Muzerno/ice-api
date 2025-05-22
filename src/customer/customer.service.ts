import { Injectable } from '@nestjs/common';
import { ICreateCustomer } from './validator/validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { Repository, DataSource } from 'typeorm';
import { UUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { NormalPoint } from 'src/entity/normal_point.entity';


@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,

    @InjectRepository(NormalPoint)
    private normalPointRepository: Repository<NormalPoint>,
  ) { }

  private generateCustomerCode(): number {
    const min = 100000000;
    const max = 999999999;
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  async create(body: ICreateCustomer) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ตรวจสอบว่ารหัสลูกค้าไม่ซ้ำ
      const existing = await queryRunner.manager
        .getRepository(Customer)
        .findOne({ where: { customer_id: body.customer_id } });

      if (existing) {
        throw new Error('รหัสลูกค้าซ้ำ กรุณารีเฟรชหน้าและลองใหม่อีกครั้ง');
      }

      // เพิ่มลูกค้าใหม่
      await queryRunner.manager.getRepository(Customer).insert({
        customer_id: body.customer_id,
        name: body.name,
        telephone: body.telephone,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        type_cus: 0,
      });

      await queryRunner.commitTransaction();

      return {
        success: true,
        customer_id: body.customer_id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to create customer: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }


  async findAll() {
    try {
      const customer = await this.customerRepository.find({
        where: { type_cus: 0 },
        order: { customer_id: 'DESC' },
      });
      return customer;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async generateNewCustomerId(): Promise<{ success: boolean; newCustomerId?: string; error?: string }> {
    try {
      // ดูลูกค้าล่าสุด 1 ราย (เพราะเรียง DESC ไว้แล้ว)
      const [latestCustomer] = await this.customerRepository.find({
        where: { type_cus: 0 },
        order: { customer_id: 'DESC' },
        take: 1,
      });

      const currentYear = new Date().getFullYear().toString().slice(-2);

      if (!latestCustomer) {
        return { success: true, newCustomerId: `C-${currentYear}-001` };
      }

      const idPattern = /^C-(\d{2})-(\d{3})$/;
      const match = String(latestCustomer.customer_id).match(idPattern);

      if (!match) {
        throw new Error('รูปแบบรหัสลูกค้าไม่ถูกต้อง');
      }

      const [, year, numberStr] = match;
      const lastNumber = parseInt(numberStr);

      // ถ้าปีเปลี่ยน ให้เริ่มต้นเลขที่ใหม่
      if (year !== currentYear) {
        return { success: true, newCustomerId: `C-${currentYear}-001` };
      }

      const newNumber = (lastNumber + 1).toString().padStart(3, '0');
      return { success: true, newCustomerId: `C-${currentYear}-${newNumber}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async findOne(customer_id: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { customer_id: customer_id },
      });
      return customer;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(customer_id: string, body: ICreateCustomer) {
    try {
      console.log('body', body);
      await this.customerRepository
        .createQueryBuilder('customer')
        .update()
        .where({ customer_id: customer_id })
        .set({
          ...body,
        })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(customer_id: string) {
    const relatedPoints = await this.normalPointRepository.find({
      where: { customer: { customer_id: customer_id } },
    });

    if (relatedPoints.length > 0) {
      throw new BadRequestException(
        'ไม่สามารถลบลูกค้าได้ เนื่องจากมีการผูกไว้กับสายรถ',
      );
    }

    await this.customerRepository.delete(customer_id);
  }
}
