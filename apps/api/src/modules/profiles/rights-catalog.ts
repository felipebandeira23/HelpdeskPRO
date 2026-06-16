/**
 * Catálogo de direitos mapeados aos módulos do Helpdesk PRO
 * Hierarquia: interface → aba → grupo → módulo
 *
 * Bitmask: READ=1, CREATE=2, UPDATE=4, DELETE=8, PURGE=16
 */

import { ProfileInterface } from '@prisma/client';

export enum RightsBit {
  READ = 1,
  CREATE = 2,
  UPDATE = 4,
  DELETE = 8,
  PURGE = 16,
}

export interface RightDefinition {
  interface: 'central' | 'simplified';
  tabs: Record<string, TabDefinition>;
}

export interface TabDefinition {
  label: string;
  icon?: string;
  groups: Record<string, GroupDefinition>;
}

export interface GroupDefinition {
  label: string;
  modules: ModuleDefinition[];
}

export interface ModuleDefinition {
  name: string; // identificador para ProfileRight.name
  label: string;
}

export const RIGHTS_CATALOG: Record<string, RightDefinition> = {
  central: {
    interface: 'central',
    tabs: {
      assistance: {
        label: 'Atendimento',
        icon: 'ti ti-headset',
        groups: {
          tickets: {
            label: 'Chamados',
            modules: [
              { name: 'ticket', label: 'Chamado' },
              { name: 'ticket_template', label: 'Modelo de Chamado' },
              { name: 'ticket_followup', label: 'Acompanhamento' },
              { name: 'ticket_task', label: 'Tarefa de Chamado' },
              { name: 'ticket_validation', label: 'Aprovação de Chamado' },
              { name: 'ticket_cost', label: 'Custo de Chamado' },
            ],
          },
          itil: {
            label: 'ITIL',
            modules: [
              { name: 'problem', label: 'Problema' },
              { name: 'change', label: 'Mudança' },
              { name: 'change_template', label: 'Modelo de Mudança' },
            ],
          },
          general: {
            label: 'Configuração de Atendimento',
            modules: [
              { name: 'category', label: 'Categoria' },
              { name: 'sla', label: 'SLA' },
            ],
          },
        },
      },

      assets: {
        label: 'Ativos',
        icon: 'ti ti-package',
        groups: {
          inventory: {
            label: 'Inventário',
            modules: [
              { name: 'asset', label: 'Ativo' },
              { name: 'software', label: 'Software' },
              { name: 'license', label: 'Licença' },
            ],
          },
        },
      },

      management: {
        label: 'Gestão',
        icon: 'ti ti-wallet',
        groups: {
          commercial: {
            label: 'Comercial',
            modules: [
              { name: 'customer', label: 'Cliente' },
              { name: 'contact', label: 'Contato / Fornecedor' },
              { name: 'contract', label: 'Contrato' },
            ],
          },
          documents: {
            label: 'Documentação',
            modules: [
              { name: 'document', label: 'Documento' },
            ],
          },
        },
      },

      tools: {
        label: 'Ferramentas',
        icon: 'ti ti-briefcase',
        groups: {
          knowledge: {
            label: 'Conhecimento',
            modules: [
              { name: 'knowledge_base', label: 'Base de Conhecimento' },
            ],
          },
          automation: {
            label: 'Automação',
            modules: [
              { name: 'automation', label: 'Regra de Automação' },
              { name: 'planning', label: 'Planejamento' },
            ],
          },
          analytics: {
            label: 'Análise',
            modules: [
              { name: 'report', label: 'Relatório' },
            ],
          },
        },
      },

      admin: {
        label: 'Administração',
        icon: 'ti ti-shield-check',
        groups: {
          users: {
            label: 'Acesso',
            modules: [
              { name: 'user', label: 'Usuário' },
              { name: 'group', label: 'Grupo' },
              { name: 'profile', label: 'Perfil' },
            ],
          },
          organization: {
            label: 'Organização',
            modules: [
              { name: 'entity', label: 'Entidade' },
            ],
          },
          audit: {
            label: 'Auditoria',
            modules: [
              { name: 'audit_log', label: 'Log de Auditoria' },
            ],
          },
        },
      },

      setup: {
        label: 'Configuração',
        icon: 'ti ti-settings',
        groups: {
          system: {
            label: 'Sistema',
            modules: [
              { name: 'settings', label: 'Configurações' },
              { name: 'notification', label: 'Notificação' },
            ],
          },
          security: {
            label: 'Segurança',
            modules: [
              { name: 'vault_credential', label: 'Cofre de Senhas' },
            ],
          },
        },
      },
    },
  },

  simplified: {
    interface: 'simplified',
    tabs: {
      assistance: {
        label: 'Atendimento',
        icon: 'ti ti-headset',
        groups: {
          tickets: {
            label: 'Meus Chamados',
            modules: [
              { name: 'ticket', label: 'Criar Chamado' },
              { name: 'ticket_followup', label: 'Acompanhamentos' },
            ],
          },
        },
      },

      tools: {
        label: 'Ferramentas',
        icon: 'ti ti-briefcase',
        groups: {
          knowledge: {
            label: 'Conhecimento',
            modules: [
              { name: 'knowledge_base', label: 'Base de Conhecimento' },
            ],
          },
        },
      },
    },
  },
};

/**
 * Obter todos os módulos de uma interface
 */
export function getAllModules(
  interfaceType: ProfileInterface | 'central' | 'simplified' | undefined,
): ModuleDefinition[] {
  const modules: ModuleDefinition[] = [];
  let key: 'central' | 'simplified' = 'central';

  if (interfaceType === ProfileInterface.SIMPLIFIED || interfaceType === 'simplified') {
    key = 'simplified';
  }

  const tabs = RIGHTS_CATALOG[key].tabs;

  Object.values(tabs).forEach((tab) => {
    Object.values(tab.groups).forEach((group) => {
      modules.push(...group.modules);
    });
  });

  return modules;
}

/**
 * Obter nomes de todos os módulos
 */
export function getAllModuleNames(
  interfaceType?: ProfileInterface | 'central' | 'simplified',
): string[] {
  return getAllModules(interfaceType).map((m) => m.name);
}
