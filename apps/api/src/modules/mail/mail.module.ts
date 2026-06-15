import { Module } from '@nestjs/common';
import { MailInboxService } from './mail-inbox.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SLAModule } from '../sla/sla.module';

@Module({
  imports: [SLAModule],
  providers: [MailInboxService, PrismaService],
  exports: [MailInboxService],
})
export class MailModule {}
