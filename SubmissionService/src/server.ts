import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { serverConfig } from "./config";

import "./config/redis.config";

import v1Router from "./routers/v1/index.routers";
import v2Router from "./routers/v2/index.router";
import { appErrorHandler, genericErrorHandler } from "./Middlewares/error-middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./Middlewares/correlation.middleware";
import { connectDB } from "./config/db.config";

const app = express();

app.use(express.json());

/**
 * Register routers
 */
app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

/**
 * Error handlers
 */
app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  logger.info(`Press Ctrl+C to stop the server.`);

  await connectDB();
});
