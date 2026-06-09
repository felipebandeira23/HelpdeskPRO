import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Prisma, Customer } from '@prisma/client';

@Controller('api/customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Post()
  create(@Body() data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<Customer[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Customer> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.CustomerUpdateInput,
  ): Promise<Customer> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.delete(id);
  }
}
