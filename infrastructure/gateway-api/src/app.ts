import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { IGatewayService } from './Domain/services/IGatewayService';
import { GatewayService } from './Services/GatewayService';
import { GatewayController } from './WebAPI/GatewayController';
import axios from 'axios';
import { AxiosAuthClient } from './Infrastructure/clients/AxiosAuthClient';
import { AxiosUserClient } from './Infrastructure/clients/AxiosUserClient';
import { UserAccessPolicy } from './Services/UserAccessPolicy';
import { IAuthClient } from './Domain/clients/IAuthClient';
import { IUserClient } from './Domain/clients/IUserClient';
import { IUserAccessPolicy } from './Domain/services/IUserAccessPolicy';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

// Services
const authServiceApi = process.env.AUTH_SERVICE_API || "";
const userServiceApi = process.env.USER_SERVICE_API || "";

const authHttpClient = axios.create({
  baseURL: authServiceApi,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

const userHttpClient = axios.create({
  baseURL: userServiceApi,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

const authClient: IAuthClient = new AxiosAuthClient(authHttpClient);
const userClient: IUserClient = new AxiosUserClient(userHttpClient);
const userAccessPolicy: IUserAccessPolicy = new UserAccessPolicy();
const gatewayService: IGatewayService = new GatewayService(authClient, userClient, userAccessPolicy);

// WebAPI routes
const gatewayController = new GatewayController(gatewayService);

// Registering routes
app.use('/api/v1', gatewayController.getRouter());

export default app;
