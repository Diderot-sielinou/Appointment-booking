class AppError extends Error {
  constructor(message, status) {
    super(Array.isArray(message) ? message.join('; ') : message);
    this.status = status;
  }
}

export default AppError;
