import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { VaultService } from './vault.service';

@Controller('api/vault')
export class VaultController {
  constructor(private service: VaultService) {}

  @Post('credentials')
  storeCredential(@Body() data: any) {
    return this.service.storeCredential(data);
  }

  @Get('credentials/:userId')
  getCredentials(@Param('userId') userId: string) {
    return this.service.getCredentials(userId);
  }

  @Get('credentials/:id')
  getCredential(@Param('id') id: string) {
    return this.service.getCredential(id);
  }

  @Patch('credentials/:id')
  updateCredential(@Param('id') id: string, @Body() data: any) {
    return this.service.updateCredential(id, data);
  }

  @Delete('credentials/:id')
  deleteCredential(@Param('id') id: string) {
    return this.service.deleteCredential(id);
  }
}
