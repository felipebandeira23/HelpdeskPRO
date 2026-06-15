'use client';

import { useState, useEffect } from 'react';

interface UseSettingsResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  saving: boolean;
  save: (data: T) => Promise<void>;
  reset: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para gerenciar configurações com persistência no API
 * Sincroniza automaticamente com /api/settings/:category
 */
export function useSettings<T = Record<string, any>>(
  category: string,
  defaults: T,
): UseSettingsResult<T> {
  const [data, setData] = useState<T>(defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carrega configurações iniciais
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/settings/${category}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar configurações: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result || defaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setData(defaults);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [category, defaults]);

  // Salva configurações no API
  const save = async (newData: T) => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/settings/${category}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!response.ok) {
        throw new Error(`Erro ao salvar configurações: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result || newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Reseta para defaults
  const reset = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/settings/${category}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Erro ao resetar configurações: ${response.statusText}`);
      }
      setData(defaults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Recarrega as configurações
  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/settings/${category}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar configurações: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result || defaults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    saving,
    save,
    reset,
    refetch,
  };
}
