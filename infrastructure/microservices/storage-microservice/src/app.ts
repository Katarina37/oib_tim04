import express, { Application, Request, Response } from "express";

export function createApp(): Application {
    const app = express();
    app.use(express.json());

    // Health check
    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).json({ status: "OK", service: "storage-microservice" });
    });

    return app;
}
