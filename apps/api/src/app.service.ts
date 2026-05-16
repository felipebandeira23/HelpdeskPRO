import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API HelpdeskPRO v0.1.0 rodando 🚀';
  }
}
