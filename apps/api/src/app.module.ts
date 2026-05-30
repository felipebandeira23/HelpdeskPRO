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
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AutomationModule } from './modules/automation/automation.module';
import { AssetsModule } from './modules/assets/assets.module';
import { PortalModule } from './modules/portal/portal.module';
import { ChatModule } from './modules/chat/chat.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { VaultModule } from './modules/vault/vault.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
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
    DashboardModule,
    AutomationModule,
    AssetsModule,
    PortalModule,
    ChatModule,
    RatingsModule,
    VaultModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
