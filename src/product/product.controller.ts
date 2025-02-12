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

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.productService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() body: IUpdateProduct) {
    return await this.productService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.productService.remove(id);
  }

  @Get(`/stock/:id`)
  async findAllProductInCar(@Param('id') id: number) {
    return await this.productService.findAllProductInCar(id);
  }
}
