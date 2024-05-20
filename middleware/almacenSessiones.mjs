import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { conexion } from '../logica/componentes/db.mjs';

const duracionSessionServidor = parseInt(process.env.DURACION_SERVIDOR, 10)
const duracionSessionCliente = parseInt(process.env.DURACION_CLIENTE, 10)

const almacenSessiones = new (pgSession(session))({
  pool: conexion,
  tableName: 'sessiones',
  pruneSessionInterval: duracionSessionServidor,
  logErrors: true,
  createTableIfMissing: true,
  max: 100,
  maxAge: 1000,
  ttl: 1000,
  errorLog: console.error
});


export const configuracionSession = session({
  store: almacenSessiones,
  secret: process.env.SECRET,
  name: 'VitiniID',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    secure: true,
    maxAge: duracionSessionCliente,
    sameSite: true,
    expires: duracionSessionCliente,
    httpOnly: true,
    rolling: false,
  }
})
