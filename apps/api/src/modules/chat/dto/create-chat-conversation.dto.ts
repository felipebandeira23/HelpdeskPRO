import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateChatConversationDto {
  @IsString()
  requesterId!: string;

  @IsString()
  requesterName!: string;

  @IsEmail()
  requesterEmail!: string;

  @IsOptional()
  @IsString()
  channel?: string;
}
