import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PasswordValidationService } from './password-validation.service';
import { SecurityConfigService } from './security-config.service';

@Module({
  imports: [SettingsModule],
  providers: [PasswordValidationService, SecurityConfigService],
  exports: [PasswordValidationService, SecurityConfigService],
})
export class SecurityModule {}
