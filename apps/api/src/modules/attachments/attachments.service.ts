import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Attachment } from '@prisma/client';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { ReadStream } from 'fs';

/** Arquivo recebido via multer (tipagem mínima para evitar dependência de @types/multer) */
export interface UploadedFileLike {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export const UPLOADS_DIR = join(process.cwd(), 'uploads');

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

// Extensões executáveis bloqueadas por segurança
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.ps1', '.vbs', '.js',
];

export function ensureUploadsDir(): void {
  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {
    ensureUploadsDir();
  }

  async attachToTicket(
    ticketId: string,
    file: UploadedFileLike,
    uploadedById: string,
    followupId?: string,
  ): Promise<Attachment> {
    this.validateFile(file);

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      this.safeUnlink(file.path);
      throw new NotFoundException('Ticket não encontrado');
    }

    return this.prisma.attachment.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        ticketId,
        followupId: followupId || null,
        uploadedById,
      },
    });
  }

  async listByTicket(ticketId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { ticketId },
      include: { uploadedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDownloadStream(
    id: string,
  ): Promise<{ stream: ReadStream; attachment: Attachment }> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');

    const filePath = join(UPLOADS_DIR, attachment.filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado no disco');
    }

    return { stream: createReadStream(filePath), attachment };
  }

  async delete(id: string, userId: string, isAdmin: boolean): Promise<{ message: string }> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');

    if (!isAdmin && attachment.uploadedById !== userId) {
      throw new BadRequestException(
        'Apenas quem enviou o anexo (ou um admin) pode excluí-lo',
      );
    }

    await this.prisma.attachment.delete({ where: { id } });
    this.safeUnlink(join(UPLOADS_DIR, attachment.filename));
    return { message: 'Anexo excluído com sucesso' };
  }

  private validateFile(file: UploadedFileLike): void {
    if (file.size > MAX_FILE_SIZE) {
      this.safeUnlink(file.path);
      throw new BadRequestException('Arquivo excede o limite de 25 MB');
    }
    const lower = file.originalname.toLowerCase();
    if (BLOCKED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      this.safeUnlink(file.path);
      throw new BadRequestException('Tipo de arquivo não permitido');
    }
  }

  private safeUnlink(path: string): void {
    try {
      if (existsSync(path)) unlinkSync(path);
    } catch {
      // arquivo pode já ter sido removido — não é erro fatal
    }
  }
}
