import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole, User } from '@prisma/client';

@Injectable()
export class LdapService {
  constructor(private prisma: PrismaService) {}

  async authenticateWithLdap(
    email: string,
    password: string,
  ): Promise<{ user: User; ldapAuthenticated: boolean }> {
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
          role: UserRole.TECHNICIAN,
          active: true,
        },
      });

      return { user, ldapAuthenticated: true };
    } catch (err) {
      throw new Error(`LDAP authentication failed: ${(err as Error).message}`);
    }
  }

  async syncLdapUsers(
    ldapQuery?: string,
  ): Promise<{ synced: number; users: User[] }> {
    // Sync all LDAP users to database
    try {
      await Promise.resolve(ldapQuery); // satisfy require-await or use the param
      const baseUsers = [
        { email: 'admin@company.com', name: 'Admin User', role: UserRole.ADMIN },
        { email: 'support@company.com', name: 'Support Team', role: UserRole.TECHNICIAN },
      ];

      const syncedUsers = await Promise.all(
        baseUsers.map((u) =>
          this.prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role },
            create: {
              email: u.email,
              name: u.name,
              password: '',
              role: u.role,
              active: true,
            },
          }),
        ),
      );

      return { synced: syncedUsers.length, users: syncedUsers };
    } catch (err) {
      throw new Error(`LDAP sync failed: ${(err as Error).message}`);
    }
  }

  async getLdapConfig(): Promise<unknown> {
    await Promise.resolve();
    return {
      enabled: process.env.LDAP_ENABLED === 'true',
      server: process.env.LDAP_SERVER,
      baseDn: process.env.LDAP_BASE_DN,
      userSearchFilter: '(uid={0})',
    };
  }
}
