import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entity/product.entity';
import { Repository } from 'typeorm';
import { ICreateProduct, IUpdateProduct } from './validator/validator';
import { UUID } from 'crypto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) { }
  async create(body: ICreateProduct) {
    try {
      await this.productRepository.createQueryBuilder('product')
        .insert().into(Product).values({
          name: body.name,
          price: body.price,
          amount: body.amount,

        }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findAll() {
    try {
      const product = await this.productRepository.find()
      return product
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id: id } })
      return product
    } catch (error) {

    }
  }

  async update(id: number, body: IUpdateProduct) {
    try {
      await this.productRepository.createQueryBuilder('product')
        .update()
        .set({
          name: body.name,
          price: body.price,
          amount: body.amount
        }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async remove(id: number) {
    try {
      await this.productRepository.delete(id)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
