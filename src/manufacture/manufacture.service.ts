import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { ILike, Repository } from 'typeorm';
import { ICreateManufacture, IUpdateManufacture } from './validator/validator';
import { Product } from 'src/entity/product.entity';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

@Injectable()
export class ManufactureService {
  constructor(
    @InjectRepository(Manufacture)
    private readonly manufactureRepository: Repository<Manufacture>,

    @InjectRepository(ManufactureDetail)
    private readonly manufactureDetailRepository: Repository<ManufactureDetail>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(body: ICreateManufacture) {
    try {
      let savedManufacture;
      const manufacture = new Manufacture();
      manufacture.date_time = body.date_time;
      manufacture.user_id = body.user_id;
      savedManufacture = await this.manufactureRepository.save(manufacture);

      for (const productId of body.product_id) {
        const manufacture_details = new ManufactureDetail();
        const amount = body.amount[productId];
        manufacture_details.manufacture_amount = amount;
        // manufacture_details.date_time = body.date_time;
        manufacture_details.ice_id = productId.toString();
        manufacture_details.manufacture_id = savedManufacture.id;

        const product = await this.productRepository.findOne({
          where: { ice_id: productId.toString() },
        });
        if (product) {
          product.amount += amount;
          await this.productRepository.save(product);
        }
        await this.manufactureDetailRepository.save(manufacture_details);
      }

      return savedManufacture;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async findAll(date: string): Promise<ManufactureDetail[]> {
    return await this.manufactureDetailRepository
      .createQueryBuilder('manufacture_detail')
      .leftJoinAndSelect('manufacture_detail.manufacture', 'manufacture')
      .leftJoinAndSelect('manufacture.user', 'user')
      .leftJoinAndSelect('manufacture_detail.products', 'products')
      .where("DATE_FORMAT(manufacture.date_time, '%Y-%m-%d') LIKE :date", {
        date: `%${date}%`,
      })
      .orderBy('manufacture.date_time', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    return await this.manufactureRepository.findOne({ where: { id: id } });
  }

  async update(body: IUpdateManufacture) {
    const { manufacture_id, ice_id } = body;

    if (!manufacture_id || !ice_id) {
      throw new BadRequestException('Missing manufacture_id or ice_id');
    }

    const checkData = await this.manufactureRepository.findOne({
      where: { id: manufacture_id },
      relations: [
        'manufacture_details',
        'user',
        'manufacture_details.products',
      ],
    });

    if (!checkData) {
      throw new NotFoundException(
        `Manufacture with ID ${manufacture_id} not found`,
      );
    }

    const updateManufactureData: Partial<IUpdateManufacture> = {};
    if (body.date_time !== undefined) {
      updateManufactureData.date_time = body.date_time;
      await this.manufactureRepository.update(
        manufacture_id,
        updateManufactureData,
      );
    }

    if (body.amount !== undefined) {
      await this.manufactureDetailRepository.update(
        {
          manufacture_id,
          ice_id,
        },
        {
          manufacture_amount: body.amount,
        },
      );
    }

    return true;
  }

  async remove(id: number) {
    // ลบ manufacture_detail ทั้งหมดที่เกี่ยวข้องกับ manufacture_id นี้
    await this.manufactureDetailRepository.delete({ manufacture: { id } });

    // จากนั้นลบ manufacture
    return await this.manufactureRepository.delete(id);
  }
}
