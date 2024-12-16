import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Line } from 'src/entity/transportation.entity';
import { Repository } from 'typeorm';
import { ICreateCar, ICreateLine } from './validator/validator';
import { UUID } from 'crypto';

@Injectable()
export class TransportationService {
    constructor(
        @InjectRepository(Transportation_Car)
        private transportationRepository: Repository<Transportation_Car>,

        @InjectRepository(Line)
        private LineRepository: Repository<Line>,
    ) { }

    async createCar(body: ICreateCar) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').insert().values({
                car_number: body.car_number,
                key_api: body?.key_api,
                user_id: body.user_id
            }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getAllCar() {
        try {
            const cars = await this.transportationRepository.find({ relations: ["users"] });
            return cars
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCar(id: number) {
        try {
            const car = await this.transportationRepository.findOne({ where: { id: id } });
            return car
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async updateCar(id: number, body) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').update()
                .set({ car_number: body.car_number, key_api: body.key_api }).where({ id: id }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteCar(id: number) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').delete().where({ id: id }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async createLine(body: ICreateLine) {
        try {
            const TsLine = []
            for (const item of body.customer_id) {
                console.log(item)
                TsLine.push({
                    line_name: body.line_name,
                    car_id: body.car_id,
                    customer_id: item
                })
            }
            await this.LineRepository.createQueryBuilder('Line')
                .insert()
                .values(TsLine).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getAllLines() {
        try {
            const lines = await this.LineRepository.
                find({ relations: ["transportation_car", "customer", "transportation_car.users"] });

            return lines
        } catch (error) {
            throw new Error(error.message)
        }
    }


    async getLine(id: number) {
        try {
            const line = await this.LineRepository.findOne({ where: { id: id } });
            return line
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async updateLine(id: number, body: any) {
        try {
            await this.LineRepository.createQueryBuilder('Line').update()
                .set({ // ...
                }).where({ id: id }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteLine(id: number) {
        try {
            await this.LineRepository.createQueryBuilder('Line').delete()
                .where({ id: id }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }




}
