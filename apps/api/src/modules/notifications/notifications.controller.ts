import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Notification } from '@prisma/client';

interface AuthRequest {
  user: { id: string };
}

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  list(
    @Request() req: AuthRequest,
    @Query('unread') unread?: string,
  ): Promise<Notification[]> {
    return this.service.list(req.user.id, unread === 'true');
  }

  @Get('unread-count')
  unreadCount(@Request() req: AuthRequest): Promise<{ count: number }> {
    return this.service.unreadCount(req.user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: AuthRequest): Promise<{ success: boolean }> {
    return this.service.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<{ success: boolean }> {
    return this.service.markAsRead(id, req.user.id);
  }
}
