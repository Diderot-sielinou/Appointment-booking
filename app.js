import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import createError from "http-errors";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import winstonLogger from "./utils/logger.js";
import logger from "./utils/logger.js";

// import  indexRouter from'./routes/index.j';

import authServiceProviderRouter from "./routes/authServiceProvider.js";
import authClientRouter from "./routes/authClient.js";
import timeSlotsRouter from "./routes/timeSlots.js";
import appointmentRouter from "./routes/appointment.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: winstonLogger.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth-service-provider", authServiceProviderRouter);
app.use("/auth-client", authClientRouter);
app.use("/time-slots", timeSlotsRouter);
app.use("/appointment", appointmentRouter);

// app.use('/', indexRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  logger.error(err.stack); // journalise dans fichier ou conso
  // render the error message and status
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal server error",
  });
});
export default app;
