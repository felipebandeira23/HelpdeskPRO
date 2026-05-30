import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';

@Module({
  controllers: [VaultController],
  providers: [VaultService, PrismaService],
  exports: [VaultService],
})
export class VaultModule {}
