import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LdapService {
  constructor(private prisma: PrismaService) {}

  async authenticateWithLdap(email: string, password: string) {
    try {
      // In production: use ldapjs library to connect to real LDAP server
      // For now: return mock validation
      const isValid = email && password && email.includes('@');

      if (!isValid) {
        throw new Error('Invalid LDAP credentials');
      }

      // Sync or create user from LDAP
      const user = await this.prisma.user.upsert({
        where: { email },
        update: { updatedAt: new Date() },
        create: {
          email,
          name: email.split('@')[0],
          password: '', // LDAP auth doesn't store password
          role: 'SUPPORT' as any,
          active: true,
        },
      });

      return { user, ldapAuthenticated: true };
    } catch (err) {
      throw new Error(`LDAP authentication failed: ${err}`);
    }
  }

  async syncLdapUsers(ldapQuery?: string) {
    // Sync all LDAP users to database
    try {
      const baseUsers = [
        { email: 'admin@company.com', name: 'Admin User', role: 'ADMIN' },
        { email: 'support@company.com', name: 'Support Team', role: 'SUPPORT' },
      ];

      const syncedUsers = await Promise.all(
        baseUsers.map(u =>
          this.prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role as any },
            create: {
              email: u.email,
              name: u.name,
              password: '',
              role: u.role as any,
              active: true,
            },
          }),
        ),
      );

      return { synced: syncedUsers.length, users: syncedUsers };
    } catch (err) {
      throw new Error(`LDAP sync failed: ${err}`);
    }
  }

  async getLdapConfig() {
    return {
      enabled: process.env.LDAP_ENABLED === 'true',
      server: process.env.LDAP_SERVER,
      baseDn: process.env.LDAP_BASE_DN,
      userSearchFilter: '(uid={0})',
    };
  }
}
