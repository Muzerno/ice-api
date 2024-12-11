import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Manufacture } from 'src/entity/manufacture.entit.entity';
import { ManufactureDetail } from 'src/entity/manufacture_detail.entity';
import { Repository } from 'typeorm';
import { ICreateManufacture } from './validator/validator';
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
            const manufacture = new Manufacture();
            manufacture.date_time = body.date_time;
            manufacture.user_id = body.user_id;
            const savedManufacture = await this.manufactureRepository.save(manufacture);

            if (!savedManufacture) {
                throw new Error('Failed to save manufacture');
            }

            const manufacture_details = new ManufactureDetail();
            manufacture_details.manufacture_amount = body.amount;
            manufacture_details.date_time = body.date_time;
            manufacture_details.ice_id = body.product_id;
            manufacture_details.manufacture_id = savedManufacture.id;
            const product = await this.productRepository.findOne({ where: { id: body.product_id } });

            product.amount += body.amount
            await this.productRepository.save(product)
            return await this.manufactureDetailRepository.save(manufacture_details);
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
    }


    async findAll() {
        return await this.manufactureRepository.find({ relations: ["manufacture_details", "user", "manufacture_details.products"] });
    }

    async findOne(id: number) {
        return await this.manufactureRepository.findOne({ where: { id: id } });
    }

    async update(id: number, body: ICreateManufacture) {
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
        return await this.manufactureRepository.delete(id);
    }
}
