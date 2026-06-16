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
import { LdapModule } from './modules/ldap/ldap.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { BillingModule } from './modules/billing/billing.module';
import { TVModeModule } from './modules/tvmode/tvmode.module';
import { NetworkModule } from './modules/network/network.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { AuditModule } from './modules/audit/audit.module';
import { MailModule } from './modules/mail/mail.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { PrismaService } from './common/prisma/prisma.service';
import { CronModule } from './modules/cron/cron.module';

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
    LdapModule,
    WhatsappModule,
    BillingModule,
    TVModeModule,
    NetworkModule,
    UsersModule,
    GroupsModule,
    CustomersModule,
    TasksModule,
    CategoriesModule,
    AttachmentsModule,
    AuditModule,
    MailModule,
    SettingsModule,
    ProfilesModule,
    DiscoveryModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
