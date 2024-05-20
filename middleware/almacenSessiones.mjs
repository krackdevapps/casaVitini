import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { conexion } from '../logica/componentes/db.mjs';
import dotenv from 'dotenv';
dotenv.config();


const almacenSessiones = new (pgSession(session))({
  pool: conexion,
  tableName: 'sessiones',
  pruneSessionInterval: process.env.DURACION_SERVIDOR,
  logErrors: true,
  createTableIfMissing: true,
  max: 100,
  maxAge: 1000,
  ttl: 1000,
  errorLog: console.error
});


export const sessionConfig = session({
  store: almacenSessiones,
  secret: process.env.SECRET,
  name: 'VitiniID',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    secure: true,
    maxAge: process.env.DURACION_CLIENTE,
    sameSite: true,
    expires: process.env.DURACION_CLIENTE,
    httpOnly: true,
    rolling: false,
  },
})