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
    private customerRepository: Repository<Customer>
  ) { }
  async create(body: ICreateCustomer) {
    try {
      await this.customerRepository.createQueryBuilder('customer').insert().values({
        name: body.name,
        telephone: body.telephone,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
      }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findAll() {
    try {
      const customer = await this.customerRepository.find()
      return customer
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findOne(id: number) {
    try {
      const customer = await this.customerRepository.findOne({ where: { id: id } })
      return customer
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async update(id: number, body: ICreateCustomer) {
    try {
      await this.customerRepository.createQueryBuilder('customer').update()
        .set({ name: body.name, latitude: body.latitude, longitude: body.longitude, address: body.address })
        .where({ id: id }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async remove(id: number) {
    await this.customerRepository.delete(id)
  }
}
