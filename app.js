import express from'express';
import path,{dirname}  from'path';
import { fileURLToPath } from 'node:url';
import cookieParser from'cookie-parser';
import logger from'morgan';
import createError from 'http-errors'


import winstonLogger from "./utils/logger.js"

import  indexRouter from'./routes/index.js';
import usersRouter from'./routes/users.js';
import authServiceProviderRouter from './routes/auth-service-provider.js'
import autClientRouter from './routes/auth-client.js'

const app = express();
const __filname  = fileURLToPath(import.meta.url)
const __dirname = dirname(__filname)


const morganFormat = process.env.NODE_ENV === "production" ? "dev" : 'combined'
app.use(logger(morganFormat, { stream: winstonLogger.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth-service-provider', authServiceProviderRouter)
app.use('/auth-client',autClientRouter)


app.use('/', indexRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // render the error message and status
  res.status(err.status || 500).json({
    status: err.status,
    message: err.message,
  });
});

export default app;
