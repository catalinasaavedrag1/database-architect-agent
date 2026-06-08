export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApprovalRequiredError extends AppError {
  constructor(message = 'This action requires explicit approval.', details?: unknown) {
    super(message, 403, details);
    this.name = 'ApprovalRequiredError';
  }
}

