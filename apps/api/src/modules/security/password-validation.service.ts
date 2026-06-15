import { Injectable, BadRequestException } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  specialChars: string;
}

/**
 * Valida senhas contra a política configurada no SettingsService
 */
@Injectable()
export class PasswordValidationService {
  constructor(private settings: SettingsService) {}

  async validatePassword(password: string): Promise<boolean> {
    const policy = await this.settings.getSettings<PasswordPolicy>(
      'password_policy',
      {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: false,
        specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      },
    );

    const errors: string[] = [];

    // Comprimento
    if (password.length < policy.minLength) {
      errors.push(`Mínimo de ${policy.minLength} caracteres`);
    }

    // Maiúsculas
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Deve conter ao menos uma maiúscula (A-Z)');
    }

    // Minúsculas
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Deve conter ao menos uma minúscula (a-z)');
    }

    // Números
    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Deve conter ao menos um número (0-9)');
    }

    // Caracteres especiais
    if (policy.requireSpecial) {
      const specialRegex = new RegExp(`[${policy.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
      if (!specialRegex.test(password)) {
        errors.push(
          `Deve conter ao menos um caractere especial: ${policy.specialChars}`,
        );
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Senha não atende aos requisitos de política',
        errors,
      });
    }

    return true;
  }

  async getPolicy(): Promise<PasswordPolicy> {
    return this.settings.getSettings('password_policy', {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: false,
      specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    });
  }
}
