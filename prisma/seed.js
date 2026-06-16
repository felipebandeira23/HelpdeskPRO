const { PrismaClient, TicketStatus, TicketPriority, ProfileInterface } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const adminHash = await bcrypt.hash('admin123', 12);
  const techHash = await bcrypt.hash('tech123', 12);
  const userHash = await bcrypt.hash('user123', 12);

  // ─── Criar perfis padrão ───
  const adminProfile = await prisma.profile.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      interface: ProfileInterface.CENTRAL,
      isDefault: false,
      comment: 'Perfil com acesso total ao sistema',
    },
  });

  const techProfile = await prisma.profile.upsert({
    where: { name: 'Técnico' },
    update: {},
    create: {
      name: 'Técnico',
      interface: ProfileInterface.CENTRAL,
      isDefault: false,
      comment: 'Perfil para técnicos de suporte',
    },
  });

  const viewerProfile = await prisma.profile.upsert({
    where: { name: 'Usuário Comum' },
    update: {},
    create: {
      name: 'Usuário Comum',
      interface: ProfileInterface.CENTRAL,
      isDefault: true,
      comment: 'Perfil para usuários finais',
    },
  });

  // ─── Criar usuários vinculados aos perfis ───
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@helpdeskpro.local' },
    update: { password: adminHash },
    create: {
      email: 'admin@helpdeskpro.local',
      name: 'Administrador',
      password: adminHash,
      profileId: adminProfile.id,
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
      profileId: techProfile.id,
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
      profileId: viewerProfile.id,
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

  // ─── Categorias (hierárquicas, padrão GLPI) ───────────────────────────────
  const catHardware = await prisma.category.create({
    data: { name: 'Hardware', color: '#E85D2D' },
  });
  const catSoftware = await prisma.category.create({
    data: { name: 'Software', color: '#2B73C9' },
  });
  const catRede = await prisma.category.create({
    data: { name: 'Rede', color: '#2DB87D' },
  });
  const catAcesso = await prisma.category.create({
    data: { name: 'Acessos e Senhas', color: '#8B5CF6' },
  });
  await prisma.category.createMany({
    data: [
      { name: 'Impressora', parentId: catHardware.id, color: '#E85D2D' },
      { name: 'Computador', parentId: catHardware.id, color: '#E85D2D' },
      { name: 'Monitor / Periféricos', parentId: catHardware.id, color: '#E85D2D' },
      { name: 'Sistema Acadêmico', parentId: catSoftware.id, color: '#2B73C9' },
      { name: 'Pacote Office', parentId: catSoftware.id, color: '#2B73C9' },
      { name: 'Wi-Fi', parentId: catRede.id, color: '#2DB87D' },
      { name: 'VPN', parentId: catRede.id, color: '#2DB87D' },
    ],
  });

  // ─── Expediente padrão (seg–sex, 08:00–18:00) ────────────────────────────
  await prisma.businessHours.createMany({
    data: [
      { weekday: 0, start: '08:00', end: '18:00', enabled: false },
      { weekday: 1, start: '08:00', end: '18:00', enabled: true },
      { weekday: 2, start: '08:00', end: '18:00', enabled: true },
      { weekday: 3, start: '08:00', end: '18:00', enabled: true },
      { weekday: 4, start: '08:00', end: '18:00', enabled: true },
      { weekday: 5, start: '08:00', end: '18:00', enabled: true },
      { weekday: 6, start: '08:00', end: '18:00', enabled: false },
    ],
  });

  // ─── Feriados nacionais fixos (recorrentes) ───────────────────────────────
  await prisma.holiday.createMany({
    data: [
      { name: 'Confraternização Universal', date: new Date('2026-01-01'), recurring: true },
      { name: 'Tiradentes', date: new Date('2026-04-21'), recurring: true },
      { name: 'Dia do Trabalho', date: new Date('2026-05-01'), recurring: true },
      { name: 'Independência do Brasil', date: new Date('2026-09-07'), recurring: true },
      { name: 'Nossa Senhora Aparecida', date: new Date('2026-10-12'), recurring: true },
      { name: 'Finados', date: new Date('2026-11-02'), recurring: true },
      { name: 'Proclamação da República', date: new Date('2026-11-15'), recurring: true },
      { name: 'Natal', date: new Date('2026-12-25'), recurring: true },
    ],
  });

  // ─── Políticas de SLA (global + por prioridade) ──────────────────────────
  await prisma.slaPolicy.createMany({
    data: [
      {
        name: 'SLA Padrão',
        responseMinutes: 480, // 8h úteis
        solutionMinutes: 2400, // 40h úteis (~1 semana)
        businessHoursOnly: true,
      },
      {
        name: 'SLA Urgente',
        priority: TicketPriority.URGENT,
        responseMinutes: 60,
        solutionMinutes: 480,
        businessHoursOnly: true,
      },
      {
        name: 'SLA Alta',
        priority: TicketPriority.HIGH,
        responseMinutes: 240,
        solutionMinutes: 960,
        businessHoursOnly: true,
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
