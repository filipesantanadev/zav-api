export class FutureDateTransactionError extends Error {
  constructor() {
    super('The transaction date cannot be in the future.')
  }
}
