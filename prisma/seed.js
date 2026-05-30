const { PrismaClient, UserRole, TicketStatus, TicketPriority } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const adminHash = await bcrypt.hash('admin123', 12);
  const techHash = await bcrypt.hash('tech123', 12);
  const userHash = await bcrypt.hash('user123', 12);

  // NOTE: Em produção, use bcrypt. Para desenvolvimento, senhas plaintext são OK.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@helpdeskpro.local' },
    update: { password: adminHash },
    create: {
      email: 'admin@helpdeskpro.local',
      name: 'Administrador',
      password: adminHash,
      role: UserRole.ADMIN,
      active: true,
    },
  });

  const technicianUser = await prisma.user.upsert({
    where: { email: 'tecnico@helpdeskpro.local' },
    update: { password: techHash },
    create: {
      email: 'tecnico@helpdeskpro.local',
      name: 'Técnico de Suporte',
      password: techHash,
      role: UserRole.TECHNICIAN,
      active: true,
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'usuario@helpdeskpro.local' },
    update: { password: userHash },
    create: {
      email: 'usuario@helpdeskpro.local',
      name: 'Usuário Comum',
      password: userHash,
      role: UserRole.VIEWER,
      active: true,
    },
  });

  const tiGroup = await prisma.group.create({
    data: {
      name: 'Mesa de TI',
      description: 'Equipe de suporte técnico',
    },
  });

  const rHGroup = await prisma.group.create({
    data: {
      name: 'Mesa de RH',
      description: 'Equipe de recursos humanos',
    },
  });

  await prisma.groupMember.createMany({
    data: [
      { groupId: tiGroup.id, userId: technicianUser.id },
      { groupId: tiGroup.id, userId: adminUser.id },
    ],
  });

  const asset1 = await prisma.asset.create({
    data: {
      hostname: 'desktop-001',
      ip: '192.168.1.10',
      manufacturer: 'Dell',
      model: 'Optiplex 7090',
      os: 'Windows 11 Pro',
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      hostname: 'desktop-002',
      ip: '192.168.1.11',
      manufacturer: 'Lenovo',
      model: 'ThinkCentre M90',
      os: 'Windows 10 Pro',
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Reset de Senha',
      description: 'Usuário esqueceu a senha da rede corporativa',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      requesterId: viewerUser.id,
      assignedToId: technicianUser.id,
      groupId: tiGroup.id,
      progress: 100,
      closedAt: new Date(),
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Impressora não conecta na rede',
      description: 'A impressora da sala 101 não está sendo reconhecida pela rede',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      requesterId: viewerUser.id,
      assignedToId: technicianUser.id,
      groupId: tiGroup.id,
      assetId: asset1.id,
      progress: 50,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Computador lento',
      description: 'O desktop está muito lento ao abrir programas',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      requesterId: viewerUser.id,
      groupId: tiGroup.id,
      assetId: asset2.id,
    },
  });

  await prisma.ticketFollowup.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorId: technicianUser.id,
        message: 'Senha resetada com sucesso. Usuário pode fazer login agora.',
        isInternal: false,
      },
      {
        ticketId: ticket2.id,
        authorId: technicianUser.id,
        message: 'Verificando conexão de rede da impressora...',
        isInternal: true,
      },
      {
        ticketId: ticket3.id,
        authorId: viewerUser.id,
        message: 'Não consigo abrir nem o Word sem esperar muito',
        isInternal: false,
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`
📊 Dados criados:
  - 3 usuários (admin, técnico, viewer)
  - 2 grupos (TI, RH)
  - 2 ativos/máquinas
  - 3 tickets (exemplos)
  - 3 acompanhamentos

🔐 Credenciais padrão:
  Email: admin@helpdeskpro.local | Senha: admin123
  Email: tecnico@helpdeskpro.local | Senha: tech123
  Email: usuario@helpdeskpro.local | Senha: user123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
