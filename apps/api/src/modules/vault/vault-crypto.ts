/**
 * Criptografia em repouso do cofre — AES-256-GCM.
 *
 * Formato armazenado: v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 * Chave derivada via scrypt de VAULT_KEY (ou JWT_SECRET como fallback de dev).
 * Em produção, defina VAULT_KEY exclusiva no .env.
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const PREFIX = 'v1';

function getKey(): Buffer {
  const secret = process.env.VAULT_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('VAULT_KEY ou JWT_SECRET ausente — cofre indisponível');
  }
  // salt fixo de aplicação: suficiente para derivação de chave única por instalação
  return scryptSync(secret, 'helpdeskpro-vault-salt', 32);
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptSecret(stored: string): string {
  const [prefix, ivHex, tagHex, dataHex] = stored.split(':');
  if (prefix !== PREFIX || !ivHex || !tagHex || !dataHex) {
    // Valor legado em texto puro (anterior à criptografia) — retorna como está.
    // O service re-criptografa na próxima escrita.
    return stored;
  }
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

export function isEncrypted(stored: string): boolean {
  return stored.startsWith(`${PREFIX}:`);
}
