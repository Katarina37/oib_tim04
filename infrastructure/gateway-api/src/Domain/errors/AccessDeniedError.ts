export class AccessDeniedError extends Error {
  constructor(message = "Pristup odbijen") {
    super(message);
    this.name = "AccessDeniedError";
  }
}