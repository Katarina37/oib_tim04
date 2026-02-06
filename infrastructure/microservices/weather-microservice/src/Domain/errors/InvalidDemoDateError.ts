export class InvalidDemoDateError extends Error {
  readonly demoDate: string;

  constructor(demoDate: string) {
    super(`Neispravan demo datum: ${demoDate}.`);
    this.name = "InvalidDemoDateError";
    this.demoDate = demoDate;
  }
}
