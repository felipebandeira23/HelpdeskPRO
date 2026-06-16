import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { TicketsModule } from '../tickets/tickets.module';
import { AutomationModule } from '../automation/automation.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TicketsModule, AutomationModule, JwtModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
