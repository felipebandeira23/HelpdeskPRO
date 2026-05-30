const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Atualizando senhas com bcrypt...');

  const updates = [
    { email: 'admin@helpdeskpro.local', password: 'admin123' },
    { email: 'tecnico@helpdeskpro.local', password: 'tech123' },
    { email: 'usuario@helpdeskpro.local', password: 'user123' },
  ];

  for (const u of updates) {
    const hash = await bcrypt.hash(u.password, 12);
    await prisma.user.update({
      where: { email: u.email },
      data: { password: hash },
    });
    console.log(`✅ Senha de ${u.email} atualizada`);
  }

  console.log('✅ Todas as senhas atualizadas!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
