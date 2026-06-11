import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Request,
  Response,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterFile } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { Response as ExpressResponse } from 'express';
import {
  AttachmentsService,
  UploadedFileLike,
  UPLOADS_DIR,
  ensureUploadsDir,
} from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Attachment } from '@prisma/client';

interface AuthRequest {
  user: { id: string; role?: string };
}

@Controller('api/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private service: AttachmentsService) {}

  @Post('ticket/:ticketId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: unknown,
          _file: MulterFile,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          ensureUploadsDir();
          cb(null, UPLOADS_DIR);
        },
        filename: (
          _req: unknown,
          file: MulterFile,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async upload(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: UploadedFileLike | undefined,
    @Request() req: AuthRequest,
    @Query('followupId') followupId?: string,
  ): Promise<Attachment> {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    return this.service.attachToTicket(ticketId, file, req.user.id, followupId);
  }

  @Get('ticket/:ticketId')
  list(@Param('ticketId') ticketId: string): Promise<Attachment[]> {
    return this.service.listByTicket(ticketId);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const { stream, attachment } = await this.service.getDownloadStream(id);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
    );
    stream.pipe(res);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    return this.service.delete(id, req.user.id, req.user.role === 'ADMIN');
  }
}
