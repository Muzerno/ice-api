import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { ILike, Repository } from 'typeorm';
import { ICreateManufacture, IUpdateManufacture } from './validator/validator';
import { Product } from 'src/entity/product.entity';

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
            let savedManufacture
            const manufacture = new Manufacture();
            manufacture.date_time = body.date_time;
            manufacture.user_id = body.user_id;
            savedManufacture = await this.manufactureRepository.save(manufacture);

            for (const productId of body.product_id) {
                const manufacture_details = new ManufactureDetail();
                const amount = body.amount[productId];
                manufacture_details.manufacture_amount = amount
                manufacture_details.date_time = body.date_time;
                manufacture_details.ice_id = productId;
                manufacture_details.manufacture_id = savedManufacture.id;

                const product = await this.productRepository.findOne({ where: { id: productId } });
                if (product) {
                    product.amount += amount;
                    await this.productRepository.save(product);
                }
                await this.manufactureDetailRepository.save(manufacture_details);
            }

            return savedManufacture;
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
    }

    async findAll(date: string): Promise<ManufactureDetail[]> {
        return await this.manufactureDetailRepository.find({
            where: {
                date_time: ILike(`%${date}%`) as any // Cast to any to bypass type checking
            },
            relations: ["manufacture", "manufacture.user", "products"]
        });
    }
    async findOne(id: number) {
        return await this.manufactureRepository.findOne({ where: { id: id } });
    }

    async update(id: number, body: IUpdateManufacture) {
        const checkData = await this.manufactureRepository.findOne({ where: { id: id }, relations: ["manufacture_details", "user", "manufacture_details.products"] });
        await this.manufactureRepository.update(id, {
            date_time: body.date_time

        });

        await this.manufactureDetailRepository.update(checkData.manufacture_details[0].id, {
            manufacture_amount: body.amount,
        })

        return true
    }

    async remove(id: number) {
        return await this.manufactureDetailRepository.delete(id);
    }
}
