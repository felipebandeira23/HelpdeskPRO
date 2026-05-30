import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ChecklistsService } from './checklists.service';

@Controller('api/tickets/:ticketId/checklists')
@UseGuards(JwtGuard)
export class ChecklistsController {
  constructor(private checklistsService: ChecklistsService) {}

  @Post()
  async createChecklist(
    @Param('ticketId') ticketId: string,
    @Body() data: { items?: { title: string; description?: string }[] },
  ) {
    return this.checklistsService.createChecklist(ticketId, data.items);
  }

  @Get()
  async getChecklist(@Param('ticketId') ticketId: string) {
    return this.checklistsService.getChecklist(ticketId);
  }

  @Post('items')
  async addItem(
    @Param('ticketId') ticketId: string,
    @Body() data: { title: string; description?: string },
  ) {
    return this.checklistsService.addChecklistItem(
      ticketId,
      data.title,
      data.description,
    );
  }

  @Patch('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() data: { status: string },
  ) {
    return this.checklistsService.updateChecklistItem(itemId, data.status);
  }

  @Delete('items/:itemId')
  async deleteItem(@Param('itemId') itemId: string) {
    return this.checklistsService.deleteChecklistItem(itemId);
  }
}
