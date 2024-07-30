import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { conexion } from '../logica/componentes/db.mjs';

// Duración de la sesión en el servidor en segundos (una semana)
const duracionSessionServidor = 7 * 24 * 60 * 60;
// Duración de la sesión en el cliente en milisegundos (una semana)
const duracionSessionCliente = 7 * 24 * 60 * 60 * 1000;


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
