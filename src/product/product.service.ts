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
          product_name: body.product_name,
          price: body.price,
          stock: body.stock,
          create_at: new Date(),

        }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findAll() {
    try {
      const product = await this.productRepository.find({ where: { status: "active" } })
      return product
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async findOne(uuid: UUID) {
    try {
      const product = await this.productRepository.findOne({ where: { uuid: uuid } })
      return product
    } catch (error) {

    }
  }

  async update(uuid: UUID, body: IUpdateProduct) {
    try {
      await this.productRepository.createQueryBuilder('product')
        .update()
        .set({
          product_name: body.product_name,
          price: body.price,
          stock: body.stock
        }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async remove(uuid: UUID) {
    try {
      await this.productRepository.createQueryBuilder('product')
        .update()
        .set({
          status: "archived",
        }).execute()
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
