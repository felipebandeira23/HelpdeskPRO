'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  PageHeader,
  Section,
  Button,
  Modal,
  Field,
  Input,
  Select,
  ErrorBanner,
  Skeleton,
  EmptyState,
} from '@/components/ui';

interface UnmanagedDevice {
  id: string;
  ip: string;
  mac: string | null;
  hostname: string | null;
  vendor: string | null;
  sysName: string | null;
  sysDescr: string | null;
  connectedSwitchIp: string | null;
  switchPort: string | null;
  status: 'NEW' | 'ACKNOWLEDGED' | 'IMPORTED' | 'IGNORED';
  lastSeen: string;
  importedAssetId: string | null;
}

interface ScanRun {
  id: string;
  subnet: string;
  status: 'RUNNING' | 'SUCCESS' | 'ERROR';
  hostsAlive: number;
  devicesFound: number;
  newDevices: number;
  startedAt: string;
  finishedAt: string | null;
  error: string | null;
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'Novo', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  ACKNOWLEDGED: { label: 'Reconhecido', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  IMPORTED: { label: 'Importado', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  IGNORED: { label: 'Ignorado', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

export default function DiscoveryPage() {
  const [devices, setDevices] = useState<UnmanagedDevice[]>([]);
  const [scans, setScans] = useState<ScanRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<UnmanagedDevice | null>(null);
  const [importForm, setImportForm] = useState({ hostname: '', assetType: 'COMPUTER' });

  const loadDevices = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<UnmanagedDevice[]>('/api/discovery/devices');
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dispositivos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadScans = useCallback(async () => {
    try {
      const data = await api.get<ScanRun[]>('/api/discovery/runs?limit=10');
      setScans(Array.isArray(data) ? data : []);
    } catch (err) {
      // Silently fail for scans
    }
  }, []);

  useEffect(() => {
    loadDevices();
    loadScans();
  }, [loadDevices, loadScans]);

  const startScan = async () => {
    setScanning(true);
    setError(null);
    try {
      // For now, we just show a message since subnet needs to be configured
      setError('Subnet não configurado. Configure em Configurações > Integrações > Descoberta de Rede');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar varredura');
    } finally {
      setScanning(false);
    }
  };

  const importDevice = async () => {
    if (!selectedDevice || !importForm.hostname) {
      setError('Preencha o nome do dispositivo');
      return;
    }

    try {
      await api.post(`/api/discovery/devices/${selectedDevice.id}/import`, {
        hostname: importForm.hostname,
        assetType: importForm.assetType,
        ip: selectedDevice.ip,
        manufacturer: selectedDevice.vendor,
      });
      setModalOpen(false);
      await loadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar dispositivo');
    }
  };

  const ignoreDevice = async (device: UnmanagedDevice) => {
    try {
      await api.patch(`/api/discovery/devices/${device.id}/ignore`);
      await loadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ignorar dispositivo');
    }
  };

  const filtered = devices.filter((d) => !statusFilter || d.status === statusFilter);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Descoberta de Rede"
        subtitle="Dispositivos encontrados via SNMP e Ping"
        action={
          <Button onClick={startScan} disabled={scanning}>
            {scanning ? '⏳ Escaneando...' : '🔍 Escanear Agora'}
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}

      {scans.length > 0 && (
        <Section title="Últimas Varreduras" actions={null}>
          <div className="space-y-2">
            {scans.slice(0, 5).map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {scan.subnet}{' '}
                    <span
                      className={`inline-block ml-2 text-xs px-2 py-0.5 rounded ${
                        scan.status === 'RUNNING'
                          ? 'bg-yellow-500/15 text-yellow-400'
                          : scan.status === 'SUCCESS'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {scan.status === 'RUNNING' ? '⏳' : scan.status === 'SUCCESS' ? '✓' : '✕'} {scan.status}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {scan.hostsAlive} hosts • {scan.devicesFound} dispositivos • {scan.newDevices} novos
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(scan.startedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        title={`Dispositivos não gerenciados (${filtered.length})`}
        actions={
          <Select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="w-40"
          >
            <option value="">Todos os status</option>
            <option value="NEW">Novo</option>
            <option value="ACKNOWLEDGED">Reconhecido</option>
            <option value="IMPORTED">Importado</option>
            <option value="IGNORED">Ignorado</option>
          </Select>
        }
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={statusFilter ? 'Nenhum dispositivo com esse status' : 'Nenhum dispositivo encontrado'}
            description={
              statusFilter
                ? 'Ajuste o filtro para ver outros dispositivos.'
                : 'Execute uma varredura de rede para descobrir dispositivos.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">MAC</th>
                  <th className="py-2 pr-4">Hostname</th>
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4">Switch / Porta</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Último visto</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((device) => {
                  const statusStyle = STATUS_STYLES[device.status];
                  return (
                    <tr key={device.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-mono text-slate-300">{device.ip}</td>
                      <td className="py-3 pr-4 font-mono text-slate-400 text-xs">
                        {device.mac ? device.mac.toUpperCase() : '—'}
                      </td>
                      <td className="py-3 pr-4">{device.sysName || device.hostname || '—'}</td>
                      <td className="py-3 pr-4 text-slate-300">{device.vendor || '—'}</td>
                      <td className="py-3 pr-4 text-slate-300">
                        {device.connectedSwitchIp && device.switchPort
                          ? `${device.connectedSwitchIp}:${device.switchPort}`
                          : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded border ${statusStyle.cls}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-400">
                        {new Date(device.lastSeen).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap space-x-2">
                        {device.status !== 'IMPORTED' && device.status !== 'IGNORED' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDevice(device);
                                setImportForm({ hostname: device.sysName || device.hostname || device.ip, assetType: 'COMPUTER' });
                                setModalOpen(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 text-xs"
                            >
                              Importar
                            </button>
                            <button
                              onClick={() => ignoreDevice(device)}
                              className="text-slate-400 hover:text-slate-300 text-xs"
                            >
                              Ignorar
                            </button>
                          </>
                        )}
                        {device.importedAssetId && (
                          <Link
                            href={`/assets/${device.importedAssetId}`}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Ver ativo
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Importar Dispositivo">
        <div className="space-y-4">
          <Field label="Hostname">
            <Input
              value={importForm.hostname}
              onChange={(e) => setImportForm({ ...importForm, hostname: e.target.value })}
              placeholder="Hostname do novo ativo"
            />
          </Field>
          <Field label="Tipo de Ativo">
            <Select
              value={importForm.assetType}
              onChange={(e) => setImportForm({ ...importForm, assetType: e.target.value })}
            >
              <option value="COMPUTER">💻 Computador</option>
              <option value="SWITCH">🔀 Switch</option>
              <option value="ROUTER">📡 Roteador</option>
              <option value="ACCESS_POINT">📶 Ponto de Acesso</option>
              <option value="NETWORK_EQUIPMENT">🌐 Equipamento de Rede</option>
              <option value="PRINTER">🖨️ Impressora</option>
              <option value="MONITOR">🖥️ Monitor</option>
              <option value="OTHER">❓ Outro</option>
            </Select>
          </Field>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setModalOpen(false)} className="bg-slate-700">
              Cancelar
            </Button>
            <Button onClick={importDevice} className="bg-emerald-600">
              Importar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
