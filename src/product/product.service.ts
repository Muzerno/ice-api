import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entity/product.entity';
import { Repository } from 'typeorm';
import { ICreateProduct, IUpdateProduct } from './validator/validator';
import { UUID } from 'crypto';
import { StockCar } from 'src/entity/stock_car.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(StockCar)
    private stockInCarRepository: Repository<StockCar>,
  ) {}
  async create(body: ICreateProduct) {
    try {
      await this.productRepository
        .createQueryBuilder('product')
        .insert()
        .into(Product)
        .values({
          name: body.name,
          price: body.price,
          amount: 0,
        })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll() {
    try {
      const product = await this.productRepository.find();
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllDropdown() {
    try {
      const product = await this.productRepository.find({
        // where: {
        //   status: "active"
        // }
      });
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id: id },
      });
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(id: number, body: IUpdateProduct) {
    try {
      await this.productRepository
        .createQueryBuilder('product')
        .update()
        .where({ id: id })
        .set({
          name: body.name,
          price: body.price,
        })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(id: number) {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllProductInCar(car_id: number) {
    try {
      const product = await this.stockInCarRepository
        .createQueryBuilder('s')
        .select([
          `s.id as id`,
          `s.ice_id as ice_id`,
          `s.amount as stock_amount`,
          `p.name as product_name`,
          `p.amount as product_amount`,
          `p.price as product_price`,
        ])
        .leftJoin('ice', 'p', 's.ice_id = p.id')
        .where({ car_id: car_id })
        .getRawMany();
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
