'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader, Panel, Button, Field, Input } from '@/components/ui';
import { useSettings } from '@/lib/use-settings';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  sender: string;
  secure: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  active: boolean;
}

interface NotificationSettings {
  smtp: SmtpConfig;
  webhooks: Webhook[];
}

export default function NotificationsSettingsPage() {
  const { data: settings, loading, saving, save } = useSettings<NotificationSettings>('notifications', {
    smtp: {
      host: 'smtp.workspace.ufrj.br',
      port: 587,
      user: 'helpdesk@coppead.ufrj.br',
      password: '',
      sender: 'Suporte HelpdeskPRO',
      secure: false,
    },
    webhooks: [
      { id: '1', name: 'Alertas de Tickets (Discord)', url: 'https://discord.com/api/webhooks/...', event: 'ticket.created', active: true },
      { id: '2', name: 'Alerta de SLAs Estourados (Teams)', url: 'https://msteams.webhook.office.com/...', event: 'sla.breached', active: true },
    ],
  });

  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvent, setNewWebhookEvent] = useState('ticket.created');

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({
      ...settings,
      smtp: settings.smtp,
    });
  };

  const addWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName || !newWebhookUrl) return;
    const updatedWebhooks = [
      ...settings.webhooks,
      {
        id: String(Date.now()),
        name: newWebhookName,
        url: newWebhookUrl,
        event: newWebhookEvent,
        active: true,
      },
    ];
    await save({ ...settings, webhooks: updatedWebhooks });
    setNewWebhookName('');
    setNewWebhookUrl('');
  };

  const deleteWebhook = async (id: string) => {
    const updatedWebhooks = settings.webhooks.filter((w) => w.id !== id);
    await save({ ...settings, webhooks: updatedWebhooks });
  };

  const toggleWebhook = async (id: string) => {
    const updatedWebhooks = settings.webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w));
    await save({ ...settings, webhooks: updatedWebhooks });
  };

  return (
    <div className="p-8 space-y-6">
      <Link
        href="/settings"
        className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block font-medium"
      >
        ← Voltar para Configurações
      </Link>
      <PageHeader
        title="Notificações & Webhooks"
        subtitle="Configure os canais de envio de alertas e integração com serviços externos"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SMTP Configuration */}
        <Panel className="lg:col-span-1">
          <h2 className="text-lg font-bold text-white mb-4">Servidor de E-mail (SMTP)</h2>
          <form onSubmit={handleSaveSmtp} className="space-y-4">
            <Field label="SMTP Host" required>
              <Input
                type="text"
                value={settings.smtp.host}
                onChange={(e) => save({ ...settings, smtp: { ...settings.smtp, host: e.target.value } })}
              />
            </Field>
            <Field label="Porta SMTP" required>
              <Input
                type="text"
                value={String(settings.smtp.port)}
                onChange={(e) => save({ ...settings, smtp: { ...settings.smtp, port: parseInt(e.target.value) || 587 } })}
              />
            </Field>
            <Field label="Usuário / E-mail Remetente" required>
              <Input
                type="email"
                value={settings.smtp.user}
                onChange={(e) => save({ ...settings, smtp: { ...settings.smtp, user: e.target.value } })}
              />
            </Field>
            <Field label="Nome Exibido" required>
              <Input
                type="text"
                value={settings.smtp.sender}
                onChange={(e) => save({ ...settings, smtp: { ...settings.smtp, sender: e.target.value } })}
              />
            </Field>
            <Button variant="primary" fullWidth type="submit" disabled={saving}>
              {saving ? '⟳ Salvando...' : '✓ Salvar SMTP'}
            </Button>
          </form>
        </Panel>

        {/* Webhooks Manager */}
        <Panel className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Webhooks de Integração</h2>
            <p className="text-xs text-slate-400">Envie gatilhos JSON em tempo real para chats corporativos (Discord, Slack, Teams)</p>
          </div>

          {/* Webhooks List */}
          <div className="space-y-3">
            {settings.webhooks.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-white">{w.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-xs font-mono">{w.url}</p>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono font-bold uppercase">{w.event}</span>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={w.active} onChange={() => toggleWebhook(w.id)} />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <button onClick={() => deleteWebhook(w.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Excluir</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Webhook Form */}
          <div className="border-t border-slate-700/50 pt-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Novo Webhook</h3>
            <form onSubmit={addWebhook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome do Webhook" required>
                  <Input
                    type="text"
                    placeholder="Ex: Discord Canal Geral"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                  />
                </Field>
                <Field label="Evento de Disparo" required>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
                    value={newWebhookEvent}
                    onChange={(e) => setNewWebhookEvent(e.target.value)}
                  >
                    <option value="ticket.created">Chamado Criado</option>
                    <option value="ticket.updated">Chamado Atualizado</option>
                    <option value="sla.warning">Aviso de SLA (Atenção)</option>
                    <option value="sla.breached">Estouro de SLA (Crítico)</option>
                  </select>
                </Field>
              </div>
              <Field label="URL do Webhook (Endpoint HTTPS)" required>
                <Input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
              </Field>
              <div className="flex justify-end">
                <Button variant="primary" type="submit">Adicionar Webhook</Button>
              </div>
            </form>
          </div>
        </Panel>
      </div>
    </div>
  );
}
