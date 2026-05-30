import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { StatsModule } from './modules/stats/stats.module';
import { SLAModule } from './modules/sla/sla.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { TicketTypesModule } from './modules/ticket-types/ticket-types.module';
import { PrismaService } from './common/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    TicketsModule,
    StatsModule,
    SLAModule,
    ChecklistsModule,
    TicketTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
