export class WeatherEffectDateNotAllowedError extends Error {
  readonly allowedDate: string;
  readonly requestedDate: string;
  readonly isDemoDate: boolean;

  constructor(allowedDate: string, requestedDate: string, isDemoDate: boolean) {
    const label = isDemoDate ? "demo datum" : "današnji datum";
    super(
      `Efekti se mogu primeniti samo za ${label} ${allowedDate}. Izabrani datum je ${requestedDate}.`
    );
    this.name = "WeatherEffectDateNotAllowedError";
    this.allowedDate = allowedDate;
    this.requestedDate = requestedDate;
    this.isDemoDate = isDemoDate;
  }
}
