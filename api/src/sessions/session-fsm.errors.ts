export class InvalidSessionTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSessionTransitionError';
  }
}
