export function getCaptureRetryMessage(
  detectedCount: number,
  expectedCount: number,
): string | null {
  if (detectedCount === 0) {
    return 'Não encontramos rostos. Tente de novo.';
  }

  if (detectedCount > 4) {
    return 'Máximo de 4 pessoas. Ajuste o enquadramento.';
  }

  if (detectedCount !== expectedCount) {
    return `Encontramos ${detectedCount} rosto(s). Esperávamos ${expectedCount}. Ajuste o enquadramento.`;
  }

  return null;
}
