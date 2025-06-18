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
  @Get(`/drowdown`)
  async findAllDropDown() {
    return await this.productService.findAllDropdown();
  }

  @Get(':ice_id')
  async findOne(@Param('ice_id') ice_id: number) {
    return await this.productService.findOne(ice_id);
  }

  @Patch(':ice_id')
  async update(@Param('ice_id') ice_id: number, @Body() body: IUpdateProduct) {
    return await this.productService.update(ice_id, body);
  }

  @Delete(':ice_id')
  async remove(@Param('ice_id') ice_id: number) {
    return await this.productService.remove(ice_id);
  }

  @Get(`/stock/:id`)
  async findAllProductInCar(@Param('id') id: number) {
    return await this.productService.findAllProductInCar(id);
  }
}
