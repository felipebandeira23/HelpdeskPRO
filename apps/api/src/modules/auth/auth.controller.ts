import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import {
  LoginThrottleGuard,
  registerLoginFailure,
  registerLoginSuccess,
} from '../../common/guards/login-throttle.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  async login(
    @Body() dto: LoginDto,
    @Request() req: ExpressRequest,
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string; role: string } }> {
    const ip = req.ip || 'unknown';
    try {
      const result = await this.authService.login(dto);
      registerLoginSuccess(ip);
      return result;
    } catch (err) {
      registerLoginFailure(ip);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() _req: ExpressRequest): { message: string } {
    return { message: 'Logout realizado com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  getProfile(@Request() req: ExpressRequest): { id: string; email: string; name: string; role: string } {
    const user = req.user as { id: string; email: string; name: string; role: string };
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
