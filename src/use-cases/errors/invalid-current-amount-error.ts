export class InvalidCurrentAmountError extends Error {
  constructor() {
    super('The current amount cannot be negative.')
  }
}
