import { PrismaClient, ProfileInterface } from '@prisma/client';

const prisma = new PrismaClient();

// Bitmask: READ=1, CREATE=2, UPDATE=4, DELETE=8, PURGE=16
const RIGHTS = {
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8,
  PURGE: 16,
};

const FULL = RIGHTS.READ | RIGHTS.CREATE | RIGHTS.UPDATE | RIGHTS.DELETE | RIGHTS.PURGE; // 31
const READ_CREATE_UPDATE = RIGHTS.READ | RIGHTS.CREATE | RIGHTS.UPDATE; // 7
const READ_ONLY = RIGHTS.READ; // 1
const NONE = 0;

// Catálogo de módulos (será expandido na Fase 2)
const MODULES = [
  // Atendimento
  'ticket',
  'ticket_task',
  'ticket_followup',
  'ticket_validation',
  'ticket_template',
  'problem',
  'change',
  'change_template',
  'sla',
  'category',

  // Ativos
  'asset',
  'software',
  'license',
  'contract',
  'infocom',

  // Gestão
  'customer',
  'contact',
  'supplier',
  'document',
  'vault_credential',
  'budget',

  // Ferramentas
  'knowledge_base',
  'report',
  'automation',
  'planning',

  // Administração
  'user',
  'group',
  'entity',
  'profile',
  'audit_log',

  // Configuração
  'settings',
  'notification',
];

interface ProfileRightsDefinition {
  [module: string]: number;
}

async function seedProfiles() {
  console.log('🌱 Seeding profiles and rights...');

  // Profile 1: Administrador (acesso completo)
  const adminRights: ProfileRightsDefinition = {};
  MODULES.forEach((module) => {
    adminRights[module] = FULL;
  });

  const admin = await prisma.profile.create({
    data: {
      name: 'Administrador',
      interface: ProfileInterface.CENTRAL,
      isDefault: true,
      twoFactorEnforced: false,
      comment: 'Acesso completo a todas as funcionalidades do sistema',
      rights: {
        create: Object.entries(adminRights).map(([name, rights]) => ({
          name,
          rights,
        })),
      },
    },
  });
  console.log(`✓ Created profile: ${admin.name}`);

  // Profile 2: Técnico (acesso parcial)
  const technicianRights: ProfileRightsDefinition = {
    // Atendimento (completo)
    ticket: FULL,
    ticket_task: FULL,
    ticket_followup: FULL,
    ticket_validation: FULL,
    ticket_template: READ_ONLY,
    problem: READ_CREATE_UPDATE,
    change: READ_CREATE_UPDATE,
    change_template: READ_ONLY,
    sla: READ_ONLY,
    category: READ_ONLY,

    // Ativos (leitura)
    asset: READ_ONLY,
    software: READ_ONLY,
    license: READ_ONLY,
    contract: READ_ONLY,
    infocom: NONE,

    // Gestão (leitura)
    customer: READ_ONLY,
    contact: READ_ONLY,
    supplier: NONE,
    document: READ_ONLY,
    vault_credential: NONE,
    budget: NONE,

    // Ferramentas (parcial)
    knowledge_base: READ_ONLY,
    report: READ_ONLY,
    automation: NONE,
    planning: READ_CREATE_UPDATE,

    // Administração (nenhum)
    user: NONE,
    group: NONE,
    entity: NONE,
    profile: NONE,
    audit_log: READ_ONLY,

    // Configuração (nenhum)
    settings: NONE,
    notification: NONE,
  };

  const technician = await prisma.profile.create({
    data: {
      name: 'Técnico',
      interface: ProfileInterface.CENTRAL,
      isDefault: false,
      twoFactorEnforced: false,
      comment: 'Acesso a funcionalidades de atendimento e consulta de ativos',
      rights: {
        create: Object.entries(technicianRights).map(([name, rights]) => ({
          name,
          rights,
        })),
      },
    },
  });
  console.log(`✓ Created profile: ${technician.name}`);

  // Profile 3: Visualizador (somente leitura)
  const viewerRights: ProfileRightsDefinition = {};
  MODULES.forEach((module) => {
    // Apenas leitura de atendimento, ativos e documentos
    if (
      [
        'ticket',
        'problem',
        'change',
        'asset',
        'software',
        'license',
        'contract',
        'customer',
        'contact',
        'document',
        'knowledge_base',
        'audit_log',
      ].includes(module)
    ) {
      viewerRights[module] = READ_ONLY;
    } else {
      viewerRights[module] = NONE;
    }
  });

  const viewer = await prisma.profile.create({
    data: {
      name: 'Visualizador',
      interface: ProfileInterface.SIMPLIFIED,
      isDefault: false,
      twoFactorEnforced: false,
      comment: 'Acesso somente de leitura a atendimento e ativos',
      rights: {
        create: Object.entries(viewerRights).map(([name, rights]) => ({
          name,
          rights,
        })),
      },
    },
  });
  console.log(`✓ Created profile: ${viewer.name}`);

  // Criar usuários padrão
  console.log('\n👤 Creating default users...');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@helpdesk.local',
      name: 'Admin User',
      password: '$2b$10$...', // Placeholder - será setado via API
      profileId: admin.id,
      active: true,
    },
  });
  console.log(`✓ Created user: ${adminUser.email}`);

  const techUser = await prisma.user.create({
    data: {
      email: 'technician@helpdesk.local',
      name: 'Support Technician',
      password: '$2b$10$...',
      profileId: technician.id,
      active: true,
    },
  });
  console.log(`✓ Created user: ${techUser.email}`);

  const viewerUser = await prisma.user.create({
    data: {
      email: 'user@helpdesk.local',
      name: 'Regular User',
      password: '$2b$10$...',
      profileId: viewer.id,
      active: true,
    },
  });
  console.log(`✓ Created user: ${viewerUser.email}`);

  console.log('\n✨ Seed complete!');
}

seedProfiles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
