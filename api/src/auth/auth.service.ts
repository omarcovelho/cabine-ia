import { timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const TOKEN_EXPIRES_IN_SECONDS = 86400;

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  validatePin(pin: string): boolean {
    const expectedPin = process.env.OPERATOR_PIN;
    if (!expectedPin) {
      return false;
    }

    const provided = Buffer.from(pin);
    const expected = Buffer.from(expectedPin);

    if (provided.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(provided, expected);
  }

  signToken(): string {
    return this.jwtService.sign({ sub: 'operator' });
  }
}
