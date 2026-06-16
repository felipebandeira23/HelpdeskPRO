import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CronHandlersService } from './cron-handlers.service';
import { CRON_REGISTRY, getCronTaskDef } from './cron-registry';
import { CronTask, CronRunStatus } from '@prisma/client';

const TICK_INTERVAL_MS = 15_000; // 15 segundos
const LOG_RETENTION = 50; // manter 50 últimos logs por tarefa

@Injectable()
export class CronSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CronSchedulerService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = new Set<string>(); // IDs de tarefas em execução

  constructor(
    private prisma: PrismaService,
    @Inject(CronHandlersService) private handlers: CronHandlersService,
  ) {}

  onModuleInit(): void {
    this.logger.log('Iniciando agendador de ações automáticas...');
    this.syncRegistry().then(() => {
      this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
      this.logger.log('Agendador iniciado com sucesso');
    });
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.logger.log('Agendador parado');
    }
  }

  /**
   * Sincroniza o registry com o banco: cria tarefas faltantes,
   * atualiza metadata mas nunca sobrescreve config do usuário
   */
  private async syncRegistry(): Promise<void> {
    try {
      for (const def of CRON_REGISTRY) {
        await this.prisma.cronTask.upsert({
          where: { name: def.name },
          create: {
            name: def.name,
            label: def.label,
            description: def.description,
            itemType: def.itemType,
            frequency: def.defaultFrequency,
            runStartHour: def.defaultRunStartHour,
            runEndHour: def.defaultRunEndHour,
            param: def.defaultParam || {},
          },
          update: {
            label: def.label,
            description: def.description,
            itemType: def.itemType,
          },
        });
      }
      this.logger.log(`Registry sincronizado (${CRON_REGISTRY.length} tarefas)`);
    } catch (err) {
      this.logger.error(`Erro ao sincronizar registry: ${err}`);
    }
  }

  /**
   * Loop principal: avalia quais tarefas devem rodar
   */
  private async tick(): Promise<void> {
    try {
      const tasks = await this.prisma.cronTask.findMany({
        where: { status: 'SCHEDULED' },
      });

      for (const task of tasks) {
        if (this.shouldRun(task)) {
          this.execute(task).catch((err) =>
            this.logger.error(`Erro não tratado em execute(): ${err}`),
          );
        }
      }
    } catch (err) {
      this.logger.error(`Erro em tick(): ${err}`);
    }
  }

  private shouldRun(task: CronTask): boolean {
    // Já está executando
    if (this.running.has(task.id)) return false;

    // Nunca correu ou passou do tempo
    const now = Date.now();
    const lastRun = task.lastRun ? task.lastRun.getTime() : 0;
    if (now - lastRun < task.frequency * 1000) return false;

    // Verificar janela horária
    const hour = new Date().getHours();
    if (hour < task.runStartHour || hour >= task.runEndHour) return false;

    return true;
  }

  private async execute(task: CronTask): Promise<void> {
    this.running.add(task.id);

    try {
      const startTime = Date.now();

      // Marcar como RUNNING
      await this.prisma.cronTask.update({
        where: { id: task.id },
        data: { status: 'RUNNING' },
      });

      // Executar handler
      const result = await this.handlers.execute(task.name);

      const duration = Date.now() - startTime;
      const nextRun = new Date(Date.now() + task.frequency * 1000);

      // Atualizar task com resultado
      await this.prisma.cronTask.update({
        where: { id: task.id },
        data: {
          lastRun: new Date(),
          lastDuration: duration,
          lastStatus: result.status,
          lastMessage: result.message,
          nextRun,
          status: 'SCHEDULED',
        },
      });

      // Gravar log
      await this.prisma.cronTaskLog.create({
        data: {
          taskId: task.id,
          status: result.status,
          message: result.message,
          duration,
          startedAt: new Date(startTime),
        },
      });

      // Podar logs antigos (manter apenas LOG_RETENTION mais recentes)
      const allLogs = await this.prisma.cronTaskLog.findMany({
        where: { taskId: task.id },
        orderBy: { createdAt: 'desc' },
        skip: LOG_RETENTION,
        select: { id: true },
      });

      if (allLogs.length > 0) {
        await this.prisma.cronTaskLog.deleteMany({
          where: { id: { in: allLogs.map((l) => l.id) } },
        });
      }

      this.logger.log(
        `[${task.name}] ${result.status} (${duration}ms): ${result.message}`,
      );
    } catch (err) {
      const duration = Date.now();
      const errorMsg = err instanceof Error ? err.message : String(err);

      await this.prisma.cronTask.update({
        where: { id: task.id },
        data: {
          lastRun: new Date(),
          lastDuration: duration,
          lastStatus: 'ERROR',
          lastMessage: errorMsg,
          status: 'SCHEDULED',
        },
      });

      await this.prisma.cronTaskLog.create({
        data: {
          taskId: task.id,
          status: 'ERROR',
          message: errorMsg,
          duration,
          startedAt: new Date(),
        },
      });

      this.logger.error(`[${task.name}] ERROR: ${errorMsg}`);
    } finally {
      this.running.delete(task.id);
    }
  }

  /**
   * Executar tarefa imediatamente (para "Executar Agora")
   */
  async runNow(taskId: string): Promise<any> {
    const task = await this.prisma.cronTask.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new Error('Tarefa não encontrada');

    const startTime = Date.now();

    try {
      const result = await this.handlers.execute(task.name);
      const duration = Date.now() - startTime;

      const log = await this.prisma.cronTaskLog.create({
        data: {
          taskId,
          status: result.status,
          message: result.message,
          duration,
          startedAt: new Date(startTime),
        },
      });

      // Atualizar task
      await this.prisma.cronTask.update({
        where: { id: taskId },
        data: {
          lastRun: new Date(),
          lastDuration: duration,
          lastStatus: result.status,
          lastMessage: result.message,
          nextRun: new Date(Date.now() + task.frequency * 1000),
        },
      });

      return log;
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);

      const log = await this.prisma.cronTaskLog.create({
        data: {
          taskId,
          status: 'ERROR',
          message: errorMsg,
          duration,
          startedAt: new Date(startTime),
        },
      });

      await this.prisma.cronTask.update({
        where: { id: taskId },
        data: {
          lastRun: new Date(),
          lastDuration: duration,
          lastStatus: 'ERROR',
          lastMessage: errorMsg,
        },
      });

      return log;
    }
  }
}
