import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entity/product.entity';
import { Repository } from 'typeorm';
import { ICreateProduct, IUpdateProduct } from './validator/validator';
import { UUID } from 'crypto';
import { StockCar } from 'src/entity/stock_car.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

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
      const existingProduct = await this.productRepository.findOne({
        where: { ice_id: body.ice_id },
      });
  
      if (existingProduct) {
        throw new HttpException('ICE ID ซ้ำกับสินค้าเดิม', HttpStatus.CONFLICT);
      }
  
      await this.productRepository
        .createQueryBuilder('product')
        .insert()
        .into(Product)
        .values({
          ice_id: body.ice_id,
          name: body.name,
          price: body.price,
          amount: 0,
        })
        .execute();
  
      return { success: true };
    } catch (error) {
      // ตรวจสอบว่า error เป็น HttpException หรือไม่
      if (error instanceof HttpException) {
        throw error; // ส่งออกตามเดิม
      }
  
      // ไม่งั้นก็สร้างใหม่แบบ 500 พร้อมข้อความจริง
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async findOne(ice_id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { ice_id: ice_id.toString() },
      });
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(ice_id: number, body: IUpdateProduct) {
    try {
      await this.productRepository
        .createQueryBuilder('product')
        .update()
        .where({ ice_id: ice_id })
        .set({
          name: body.name,
          price: body.price,
        })
        .execute();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(ice_id: number) {
    try {
      await this.productRepository.delete(ice_id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllProductInCar(car_id: number) {
    try {
      const product = await this.stockInCarRepository
        .createQueryBuilder('s')
        .select([
          `s.ice_id as ice_id`,
          `s.amount as stock_amount`,
          `p.name as product_name`,
          `p.amount as product_amount`,
          `p.price as product_price`,
        ])
        .leftJoin('ice', 'p', 's.ice_id = p.ice_id')
        .where({ car_id: car_id })
        .getRawMany();
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
