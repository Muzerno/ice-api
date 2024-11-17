import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { IUpdateProduct, ReqCreateProduct } from './validator/validator';
import { UUID } from 'crypto';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  async create(@Body() createProductDto: ReqCreateProduct) {
    return await this.productService.create(createProductDto);
  }

  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: UUID) {
    return await this.productService.findOne(uuid);
  }

  @Patch(':uuid')
  async update(@Param('uuid') uuid: UUID, @Body() body: IUpdateProduct) {
    return await this.productService.update(uuid, body);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: UUID) {
    return await this.productService.remove(uuid);
  }
}
