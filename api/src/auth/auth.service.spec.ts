import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  const originalOperatorPin = process.env.OPERATOR_PIN;

  beforeEach(async () => {
    process.env.OPERATOR_PIN = '1234';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    process.env.OPERATOR_PIN = originalOperatorPin;
  });

  it('returns true for the configured operator pin', () => {
    expect(service.validatePin('1234')).toBe(true);
  });

  it('returns false for an incorrect pin', () => {
    expect(service.validatePin('9999')).toBe(false);
  });

  it('returns false when operator pin env is missing', () => {
    delete process.env.OPERATOR_PIN;
    expect(service.validatePin('1234')).toBe(false);
  });

  it('signs a token that can be verified', () => {
    const token = service.signToken();
    expect(token).toBeTruthy();
    expect(jwtService.verify(token)).toEqual(
      expect.objectContaining({ sub: 'operator' }),
    );
  });
});
