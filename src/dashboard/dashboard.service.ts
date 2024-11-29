import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { Product } from 'src/entity/product.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async getDashboard() {
        const countUser = await this.userRepository.count()
        const countProduct = await this.productRepository.count()
        const countCustomer = await this.customerRepository.count()
        return {
            countUser: countUser,
            countProduct: countProduct,
            countCustomer: countCustomer
        }
    }
}
