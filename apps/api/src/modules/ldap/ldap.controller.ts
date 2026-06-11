import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { LdapService } from './ldap.service';

@Controller('api/ldap')
@UseGuards(JwtAuthGuard)
export class LdapController {
  constructor(private service: LdapService) {}

  @Post('auth')
  authenticate(@Body() data: { email: string; password: string }) {
    return this.service.authenticateWithLdap(data.email, data.password);
  }

  @Post('sync')
  syncUsers(@Body() data?: { query?: string }) {
    return this.service.syncLdapUsers(data?.query);
  }

  @Get('config')
  getConfig() {
    return this.service.getLdapConfig();
  }
}
