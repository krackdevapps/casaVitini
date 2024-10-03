import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { conexion } from '../src/infraestructure/repository/globales/db.mjs';



const duracionSessionServidor = 900;


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

    httpOnly: true,
    rolling: false,
  }
})
