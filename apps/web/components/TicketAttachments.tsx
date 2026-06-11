'use client';

import { useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy?: { id: string; name: string };
}

interface TicketAttachmentsProps {
  ticketId: string;
  attachments: Attachment[];
  onChange: () => Promise<void> | void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜️';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return '📊';
  return '📎';
}

export default function TicketAttachments({
  ticketId,
  attachments,
  onChange,
}: TicketAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      // fetch direto: api.ts força Content-Type JSON, que quebra multipart
      const res = await fetch(`${API_URL}/api/attachments/ticket/${ticketId}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Erro ${res.status}`);
      }
      await onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDownload = async (att: Attachment) => {
    try {
      const res = await fetch(`${API_URL}/api/attachments/${att.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Falha no download');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro ao baixar arquivo');
    }
  };

  const handleDelete = async (att: Attachment) => {
    try {
      const res = await fetch(`${API_URL}/api/attachments/${att.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Erro ao excluir');
      }
      await onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir anexo');
    }
  };

  return (
    <div className="mt-6 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-slate-400 uppercase">
          Anexos ({attachments.length})
        </h3>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : '+ Anexar arquivo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-2 bg-red-900/20 border border-red-900/40 rounded p-2">
          {error}
        </p>
      )}

      {attachments.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhum anexo neste ticket.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50"
            >
              <span className="text-lg">{fileIcon(att.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleDownload(att)}
                  className="text-slate-200 text-sm hover:text-blue-400 transition-colors truncate block max-w-full text-left"
                >
                  {att.originalName}
                </button>
                <p className="text-slate-500 text-xs">
                  {formatSize(att.size)}
                  {att.uploadedBy ? ` · ${att.uploadedBy.name}` : ''} ·{' '}
                  {new Date(att.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(att)}
                className="text-slate-500 hover:text-red-400 text-sm transition-colors"
                title="Excluir anexo"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
