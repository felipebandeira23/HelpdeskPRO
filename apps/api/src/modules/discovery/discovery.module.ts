import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryController } from './discovery.controller';
import { PingService } from './ping.service';
import { SnmpService } from './snmp.service';

@Module({
  providers: [DiscoveryService, PingService, SnmpService],
  controllers: [DiscoveryController],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
