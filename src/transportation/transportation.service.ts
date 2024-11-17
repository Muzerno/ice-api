import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transportation_Car } from 'src/entity/transport_car.entity';
import { Transportation_line } from 'src/entity/transportation.entity';
import { Repository } from 'typeorm';
import { ICreateCar, ICreateLine } from './validator/validator';
import { UUID } from 'crypto';

@Injectable()
export class TransportationService {
    constructor(
        @InjectRepository(Transportation_Car)
        private transportationRepository: Repository<Transportation_Car>,

        @InjectRepository(Transportation_line)
        private transportation_lineRepository: Repository<Transportation_line>,
    ) { }

    async createCar(body: ICreateCar) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').insert().values({
                car_number: body.car_number,
                key_api: body.key_api,
                user_uid: body.user_uid
            }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getAllCar() {
        try {
            const cars = await this.transportationRepository.find({ where: { status: "active" } });
            return cars
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCar(uuid: UUID) {
        try {
            const car = await this.transportationRepository.findOne({ where: { status: "active", uuid: uuid } });
            return car
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async updateCar(uuid: UUID, body) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').update()
                .set({ car_number: body.car_number, key_api: body.key_api }).where({ uuid: uuid }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteCar(uuid: UUID) {
        try {
            await this.transportationRepository.createQueryBuilder('transportation_car').update()
                .set({ status: "deleted" }).where({ uuid: uuid }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async createLine(body: ICreateLine) {
        try {
            await this.transportation_lineRepository.createQueryBuilder('transportation_line').insert().values(
                {
                    car_number: body.car_number,
                    customer_id: body.customer_id
                }
            ).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getAllLines() {
        try {
            const lines = await this.transportation_lineRepository.find();
            return lines
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getLine(uuid: UUID) {
        try {
            const line = await this.transportation_lineRepository.findOne({ where: { uuid: uuid } });
            return line
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async updateLine(uuid: UUID, body: any) {
        try {
            await this.transportation_lineRepository.createQueryBuilder('transportation_line').update()
                .set({ // ...
                }).where({ uuid: uuid }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteLine(uuid: UUID) {
        try {
            await this.transportation_lineRepository.createQueryBuilder('transportation_line').delete()
                .where({ uuid: uuid }).execute();
        } catch (error) {
            throw new Error(error.message)
        }
    }




}
