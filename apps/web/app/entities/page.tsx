'use client';

import { useState } from 'react';
import { PageHeader, Panel, EmptyState } from '@/components/ui';

interface Entity {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  usersCount: number;
  assetsCount: number;
  ticketsCount: number;
  expanded?: boolean;
  children?: Entity[];
}

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: '1',
      name: 'COPPEAD (Entidade Raiz)',
      description: 'Entidade principal da instituição',
      parentId: null,
      usersCount: 450,
      assetsCount: 320,
      ticketsCount: 1540,
      expanded: true,
      children: [
        {
          id: '2',
          name: 'Setor Administrativo',
          description: 'RH, Financeiro e Secretaria',
          parentId: '1',
          usersCount: 45,
          assetsCount: 50,
          ticketsCount: 320,
          children: []
        },
        {
          id: '3',
          name: 'Laboratórios de Informática',
          description: 'Laboratórios de uso comum para alunos',
          parentId: '1',
          usersCount: 0,
          assetsCount: 120,
          ticketsCount: 845,
          expanded: true,
          children: [
            {
              id: '4',
              name: 'Lab Info 1 (Térreo)',
              description: 'Laboratório principal',
              parentId: '3',
              usersCount: 0,
              assetsCount: 60,
              ticketsCount: 400,
              children: []
            },
            {
              id: '5',
              name: 'Lab Info 2 (1º Andar)',
              description: 'Laboratório secundário',
              parentId: '3',
              usersCount: 0,
              assetsCount: 60,
              ticketsCount: 445,
              children: []
            }
          ]
        }
      ]
    }
  ]);

  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(entities[0]);

  const toggleExpand = (entity: Entity, list: Entity[]): Entity[] => {
    return list.map(item => {
      if (item.id === entity.id) {
        return { ...item, expanded: !item.expanded };
      }
      if (item.children) {
        return { ...item, children: toggleExpand(entity, item.children) };
      }
      return item;
    });
  };

  const renderTree = (nodes: Entity[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="w-full">
        <div 
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${selectedEntity?.id === node.id ? 'bg-blue-900/30 border border-blue-800/50' : 'hover:bg-slate-800/50 border border-transparent'}`}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
          onClick={() => setSelectedEntity(node)}
        >
          {node.children && node.children.length > 0 ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setEntities(toggleExpand(node, entities)); }}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              {node.expanded ? '▼' : '▶'}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <span className="text-xl">{depth === 0 ? '🏢' : depth === 1 ? '📂' : '📁'}</span>
          <span className={`font-medium text-sm ${selectedEntity?.id === node.id ? 'text-blue-400' : 'text-slate-200'}`}>
            {node.name}
          </span>
          <span className="ml-auto text-xs text-slate-500 font-mono bg-slate-800/80 px-2 py-0.5 rounded">
            ID: {node.id}
          </span>
        </div>
        
        {node.expanded && node.children && (
          <div className="mt-1 space-y-1">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Entidades e Multilocação" subtitle="Estrutura hierárquica para isolamento de dados, usuários e ativos" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-900/20">
          + Nova Entidade
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Panel className="lg:col-span-1 flex flex-col overflow-hidden bg-slate-900/50 border-slate-700/50">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Árvore de Entidades</h2>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {renderTree(entities)}
          </div>
        </Panel>

        <Panel className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedEntity ? (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedEntity.name}</h2>
                  <p className="text-slate-400">{selectedEntity.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded transition-colors border border-slate-700">Editar</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex flex-col">
                  <span className="text-3xl mb-2">👥</span>
                  <span className="text-2xl font-bold text-white">{selectedEntity.usersCount}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Usuários</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex flex-col">
                  <span className="text-3xl mb-2">💻</span>
                  <span className="text-2xl font-bold text-white">{selectedEntity.assetsCount}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Ativos de TI</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex flex-col">
                  <span className="text-3xl mb-2">🎫</span>
                  <span className="text-2xl font-bold text-white">{selectedEntity.ticketsCount}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Tickets Abertos</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Configurações Específicas</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium">Herdar Ativos e Usuários</h4>
                    <p className="text-xs text-slate-400">Permite que entidades filhas enxerguem dados desta entidade.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium">SLA Específico</h4>
                    <p className="text-xs text-slate-400">Aplicar tempos de resposta e solução customizados para esta entidade.</p>
                  </div>
                  <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">Configurar SLA</button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div>
                    <h4 className="text-white font-medium">Notificações por Email</h4>
                    <p className="text-xs text-slate-400">Remetente personalizado para e-mails saindo desta entidade.</p>
                  </div>
                  <div className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">suporte@coppead.ufrj.br</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon="🏢" title="Nenhuma entidade selecionada" description="Selecione uma entidade na árvore à esquerda para visualizar seus detalhes e métricas." />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
