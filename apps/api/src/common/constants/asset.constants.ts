// Asset type and telemetry constants

export const TELEMETRY_ASSET_TYPES = [
  'COMPUTER',
  'LAPTOP',
  'SERVER',
  'PHONE',
  'TABLET',
];

export function isTelemetryCapable(type: string): boolean {
  return TELEMETRY_ASSET_TYPES.includes(type);
}

export const ASSET_TYPE_LABELS: Record<string, { label: string; icon?: string }> = {
  COMPUTER: { label: 'Computador', icon: '💻' },
  LAPTOP: { label: 'Notebook', icon: '💻' },
  SERVER: { label: 'Servidor', icon: '🖥️' },
  PRINTER: { label: 'Impressora', icon: '🖨️' },
  SWITCH: { label: 'Switch', icon: '🔀' },
  ROUTER: { label: 'Roteador', icon: '📡' },
  PHONE: { label: 'Telefone', icon: '☎️' },
  TABLET: { label: 'Tablet', icon: '📱' },
  MONITOR: { label: 'Monitor', icon: '🖥️' },
  ACCESS_POINT: { label: 'Ponto de Acesso', icon: '📶' },
  NETWORK_EQUIPMENT: { label: 'Equipamento de Rede', icon: '🌐' },
  PERIPHERAL: { label: 'Periférico', icon: '⌨️' },
  CARTRIDGE: { label: 'Cartucho', icon: '🎨' },
  CONSUMABLE: { label: 'Insumo', icon: '📦' },
  RACK: { label: 'Rack', icon: '🗄️' },
  ENCLOSURE: { label: 'Chassis', icon: '📦' },
  PDU: { label: 'PDU', icon: '🔌' },
  PASSIVE_DEVICE: { label: 'Dispositivo Passivo', icon: '🔗' },
  CABLE: { label: 'Cabo', icon: '🔗' },
  OTHER: { label: 'Outro', icon: '❓' },
};
