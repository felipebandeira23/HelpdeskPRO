import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LdapService } from './ldap.service';
import { LdapController } from './ldap.controller';

@Module({
  controllers: [LdapController],
  providers: [LdapService, PrismaService],
  exports: [LdapService],
})
export class LdapModule {}
