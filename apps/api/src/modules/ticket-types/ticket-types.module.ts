import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';

@Module({
  controllers: [TicketTypesController],
  providers: [TicketTypesService, PrismaService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
