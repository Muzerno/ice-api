import { Injectable } from '@nestjs/common';
import { ICreateCustomer } from './validator/validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { Repository } from 'typeorm';
import { UUID } from 'crypto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  private generateCustomerCode(): string {
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let code = 'C-';
    for (let i = 0; i < 2; i++)
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 0; i < 5; i++)
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 2; i++)
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));

    return code;
  }

  async create(body: ICreateCustomer) {
    try {
      const customerCode = this.generateCustomerCode();

      await this.customerRepository
        .createQueryBuilder('customer')
        .insert()
        .values({
          name: body.name,
          telephone: body.telephone,
          latitude: body.latitude,
          longitude: body.longitude,
          address: body.address,
          customer_code: customerCode,
          type_cus: 0
        })
        .execute();

      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
}

  async findAll() {
    try {
      const customer = await this.customerRepository.find();
      return customer;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: id },
      });
      return customer;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(id: number, body: ICreateCustomer) {
    try {
      console.log('body', body);
      await this.customerRepository
        .createQueryBuilder('customer')
        .update()
        .where({ id: id })
        .set({
          ...body,
        })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(id: number) {
    await this.customerRepository.delete(id);
  }
}
