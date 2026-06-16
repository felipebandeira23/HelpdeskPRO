import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService, CategoryNode } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Category } from '@prisma/client';

@Controller('api/categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<(Category & { path: string })[]> {
    return this.service.findAll(includeInactive === 'true');
  }

  @Get('tree')
  findTree(): Promise<CategoryNode[]> {
    return this.service.findTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id);
  }
}
