import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcryptjs.hash('Admin@123456', 12);

  const admin = await prisma.user.create({
    data: {
      id: 'admin-001',
      email: 'admin@helpdesk.local',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create some test agents
  const agent1 = await prisma.user.create({
    data: {
      id: 'agent-001',
      email: 'agente1@helpdesk.local',
      name: 'Agente 1',
      password: await bcryptjs.hash('Agent@123456', 12),
      role: 'TECHNICIAN',
      active: true,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      id: 'agent-002',
      email: 'agente2@helpdesk.local',
      name: 'Agente 2',
      password: await bcryptjs.hash('Agent@123456', 12),
      role: 'TECHNICIAN',
      active: true,
    },
  });

  console.log('✅ Test agents created');

  // Create support group
  const group = await prisma.group.create({
    data: {
      id: 'group-001',
      name: 'Suporte Técnico',
      description: 'Grupo principal de suporte',
      members: {
        connect: [{ id: agent1.id }, { id: agent2.id }],
      },
    },
  });

  console.log('✅ Support group created');

  // Create ticket types
  await prisma.ticketType.createMany({
    data: [
      { id: 'type-001', name: 'Suporte Técnico', color: '#3B82F6' },
      { id: 'type-002', name: 'Solicitação', color: '#10B981' },
      { id: 'type-003', name: 'Incidente', color: '#EF4444' },
    ],
  });

  console.log('✅ Ticket types created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Email: admin@helpdesk.local');
  console.log('   Password: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
