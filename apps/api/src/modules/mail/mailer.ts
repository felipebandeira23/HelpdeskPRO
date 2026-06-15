/**
 * Envio SMTP — helper sem DI para evitar ciclo de módulos
 * (Notifications precisa enviar email, e o Mail inbox precisa de SLA,
 * que precisa de Notifications).
 *
 * Configuração via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
 * SMTP_FROM, SMTP_SECURE. Sem SMTP_HOST, o envio é silenciosamente
 * desabilitado (modo dev).
 */
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const logger = new Logger('Mailer');
let transporter: Transporter | null = null;
let initialized = false;

function getTransporter(): Transporter | null {
  if (initialized) return transporter;
  initialized = true;

  const host = process.env.SMTP_HOST;
  if (!host) {
    logger.warn('SMTP_HOST não configurado — envio de emails desabilitado');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

export function isMailEnabled(): boolean {
  return !!getTransporter();
}

/** Envia email sem nunca lançar — falha de email não quebra a operação. */
export async function sendMailQuick(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const t = getTransporter();
  if (!t || !to) return false;
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'HelpdeskPRO <helpdesk@localhost>',
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    logger.warn(`Falha ao enviar email para ${to}: ${err}`);
    return false;
  }
}

/** Template básico consistente com o tema do produto. */
export function emailTemplate(title: string, body: string, link?: string): string {
  const appUrl = process.env.APP_URL || 'http://localhost:3001';
  return `
  <div style="font-family:Segoe UI,Roboto,sans-serif;background:#0f172a;padding:32px;color:#e2e8f0">
    <div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:32px;border:1px solid rgba(255,255,255,0.08)">
      <h2 style="margin:0 0 16px;color:#fff">${title}</h2>
      <p style="margin:0 0 24px;line-height:1.6;color:#cbd5e1">${body}</p>
      ${
        link
          ? `<a href="${appUrl}${link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">Abrir no HelpdeskPRO</a>`
          : ''
      }
      <p style="margin:24px 0 0;font-size:12px;color:#64748b">HelpdeskPRO — mensagem automática, não responda este email diretamente.</p>
    </div>
  </div>`;
}
