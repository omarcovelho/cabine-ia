import { describe, expect, it } from 'vitest';
import { getCaptureRetryMessage } from './captureValidation';

describe('getCaptureRetryMessage', () => {
  it('returns message for zero faces', () => {
    expect(getCaptureRetryMessage(0, 1)).toBe(
      'Não encontramos rostos. Tente de novo.',
    );
  });

  it('returns message when detected count differs from expected', () => {
    expect(getCaptureRetryMessage(2, 1)).toBe(
      'Encontramos 2 rosto(s). Esperávamos 1. Ajuste o enquadramento.',
    );
  });

  it('returns message for more than four faces', () => {
    expect(getCaptureRetryMessage(5, 4)).toBe(
      'Máximo de 4 pessoas. Ajuste o enquadramento.',
    );
  });

  it('returns null when face count matches expected', () => {
    expect(getCaptureRetryMessage(2, 2)).toBeNull();
  });
});
