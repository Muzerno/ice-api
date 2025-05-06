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
  ) {}

  private generateCustomerCode(): number {
    // สร้างตัวเลข 9 หลัก (100000000 - 999999999)
    const min = 100000000;
    const max = 999999999;
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  async create(body: ICreateCustomer) {
    const queryRunner = this.dataSource.createQueryRunner(); // ใช้ dataSource แทน connection

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let customerCode: number;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!isUnique && attempts < maxAttempts) {
        attempts++;
        customerCode = this.generateCustomerCode();

        const existing = await queryRunner.manager
          .getRepository(Customer)
          .findOne({ where: { customer_id: customerCode } });

        if (!existing) {
          isUnique = true;
        }
      }

      if (!isUnique) {
        throw new Error('Cannot generate unique customer ID');
      }

      await queryRunner.manager.getRepository(Customer).insert({
        customer_id: customerCode,
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
        customer_id: customerCode,
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
      });
      return customer;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(customer_id: number) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { customer_id: customer_id },
      });
      return customer;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(customer_id: number, body: ICreateCustomer) {
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

  async remove(customer_id: number) {
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
