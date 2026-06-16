import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DiscoveryService } from './discovery.service';
import { UnmanagedStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Controller('api/discovery')
@UseGuards(JwtGuard)
export class DiscoveryController {
  constructor(private service: DiscoveryService) {}

  @Post('scan')
  runScan(
    @Body() data: { subnet: string; community?: string; version?: number; triggeredBy?: string },
  ) {
    return this.service.runScan(data.subnet, data.community, data.version, data.triggeredBy);
  }

  @Get('runs')
  getScanRuns(@Query('limit') limit?: string) {
    return this.service.getScanRuns(limit ? parseInt(limit, 10) : 20);
  }

  @Get('devices')
  getDevices(@Query('status') status?: UnmanagedStatus) {
    return this.service.getUnmanagedDevices(status);
  }

  @Post('devices/:id/import')
  importDevice(
    @Param('id') id: string,
    @Body() data: Prisma.AssetCreateInput,
  ) {
    return this.service.importDevice(id, data);
  }

  @Patch('devices/:id/ignore')
  ignoreDevice(@Param('id') id: string) {
    return this.service.ignoreDevice(id);
  }
}
