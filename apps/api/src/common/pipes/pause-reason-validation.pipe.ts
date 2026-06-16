import { Injectable, BadRequestException, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { UpdateTicketDto } from '../../modules/tickets/dto/update-ticket.dto';

@Injectable()
export class PauseReasonValidationPipe implements PipeTransform {
  transform(value: UpdateTicketDto, metadata: ArgumentMetadata) {
    if (value.status === 'PAUSED' && !value.pauseReason?.trim()) {
      throw new BadRequestException(
        'Campo pauseReason é obrigatório quando status é alterado para PAUSED',
      );
    }
    return value;
  }
}
