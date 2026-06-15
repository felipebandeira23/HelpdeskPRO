import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { SystemConfigService } from './system-config.service';

@Module({
  imports: [SettingsModule],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemModule {}
