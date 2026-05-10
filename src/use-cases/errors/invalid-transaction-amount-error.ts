export class InvalidTransactionAmountError extends Error {
  constructor() {
    super('The transaction amount must be greater than zero.')
  }
}
