import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { VaultService } from './vault.service';

@Controller('api/vault')
export class VaultController {
  constructor(private service: VaultService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get('user/:userId')
  findAll(@Param('userId') userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body() body: any) {
    return this.service.findOne(id, body.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data.userId, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Body() body: any) {
    return this.service.delete(id, body.userId);
  }
}
