import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { IAuthAPI } from "./IAuthAPI";
import { AuthResponseType } from "../../types/AuthResponseType";
import { IHttpClient } from "../http/IHttpClient";

export class AuthAPI implements IAuthAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    return this.httpClient.post<AuthResponseType>("/login", data);
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    return this.httpClient.post<AuthResponseType>("/register", data);
  }
}
