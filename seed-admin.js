const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database...');
    
    const hashedPassword = await bcryptjs.hash('Admin@123456', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@helpdesk.local',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    });

    console.log('✅ Admin user created:', admin.email);

    const agent1 = await prisma.user.create({
      data: {
        email: 'agente1@helpdesk.local',
        name: 'Agente 1',
        password: await bcryptjs.hash('Agent@123456', 12),
        role: 'TECHNICIAN',
        active: true,
      },
    });

    const agent2 = await prisma.user.create({
      data: {
        email: 'agente2@helpdesk.local',
        name: 'Agente 2',
        password: await bcryptjs.hash('Agent@123456', 12),
        role: 'TECHNICIAN',
        active: true,
      },
    });

    console.log('✅ Test agents created');

    const group = await prisma.group.create({
      data: {
        name: 'Suporte Técnico',
        description: 'Grupo principal de suporte',
      },
    });

    console.log('✅ Support group created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: admin@helpdesk.local');
    console.log('   Password: Admin@123456');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
