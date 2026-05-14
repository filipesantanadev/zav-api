export class InvalidTargetAmountError extends Error {
  constructor() {
    super('The target amount must be greater than zero.')
  }
}
