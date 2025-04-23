import express from'express';
import path,{dirname}  from'path';
import { fileURLToPath } from 'node:url';
import cookieParser from'cookie-parser';
import logger from'morgan';


import winstonLogger from "./utils/logger.js"

import  indexRouter from'./routes/index.js';
import usersRouter from'./routes/users.js';

const app = express();
const __filname  = fileURLToPath(import.meta.url)
const __dirname = dirname(__filname)


const morganFormat = process.env.NODE_ENV === "production" ? "dev" : 'combined'
app.use(logger(morganFormat, { stream: winstonLogger.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
