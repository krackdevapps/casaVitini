import express from 'express';
import path from 'path';
import router from './rutas/rutas.mjs'
// El modulo EJS es un modulo que no se llama en el script sino que lo llama node, por eso aparece transparente pero Ojo cuidao hay
import ejs from 'ejs'
import session from 'express-session'
import pgSession from 'connect-pg-simple';
import fs from 'fs';
import dotenv from "dotenv";
import https from 'https';
import controlHttps from './logica/componentes/controlHttps.mjs';
import { conexion } from './logica/componentes/db.mjs';

dotenv.config();

const minutosSesion = 60 // Minutos
const duracionGlobalSessionServidor = minutosSesion * 60 // Recuerda esto es segundos
const duracionGlobalSessionCliente = duracionGlobalSessionServidor * 1000 // Recuerda esto es en miliSegundos

// Evitar petadas por SIGTERM o admin shutdown de procesos conectados como el de la base de datos.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Alerta! ->> Algo a petado:', error.message);
});

// Instancia express
const app = express()
app.use(controlHttps);

app.set('views', './ui/constructor');
app.set('view engine', 'ejs');
// Limta a 50mb la entrad de datos y a formato json
app.use(express.raw({ limit: '50mb' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413 && 'body' in err) {
    return res.status(413).json({ error: 'Solicitud demasiado grande, Casa Vitini solo acepta peticiones de un maximo de 50MB' });
  }
  next(); // <- No se llama a next() si hay un error
});
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ extended: true }))
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use((error, entrada, salida, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    const respuesta = {
      "Casa Vitini": "Entrada de datos universalmente mal formateada, solo se acepta el formato JSON correctamanente formateado"
    }
    salida.status(400).json(respuesta);
  }
});
app.use((req, res, next) => {
  //res.setHeader('casaVitini', 'system');
  next();
});

const almacenSessiones = new (pgSession(session))({
  pool: conexion,
  tableName: 'sessiones',
  pruneSessionInterval: duracionGlobalSessionServidor,
  logErrors: true,
  createTableIfMissing: true,
  max: 100,
  maxAge: 1000,
  ttl: 1000,
  errorLog: console.error,
})

// Rutas Estaticas

// Middleware personalizado para manejar la conexión a la base de datos
const controlBaseDeDatos = async (entrada, salida, next) => {
  try {
    await conexion.query("SELECT 1"); // Intenta ejecutar una consulta simple
    // Configura la sesión solo si la consulta es exitosa
    next();
  } catch (error) {
    console.error('Alerta ->> No se puede establecer la conexion con la base de datos para esta peticion');
    if (entrada.method === 'GET') {
     salida.render('constructorV1', {'vistaGlobal': '../global/navegacion.ejs'});
    }
    if (entrada.method === 'POST') {
      const error = {
        codigo: 'mantenimiento',
        error: 'Casa Vitini esta en modo mantenimiento. Ahora mismo el procesador de peticiones no acepta peticiones. En breve se reanudara el sistema. Disculpe las molestias.'
      }
      salida.json(error)
    }
  }
};
app.use('/componentes', express.static(path.join('./ui/componentes')));
//app.use('/.well-known/acme-challenge/', express.static('/var/lib/letsencrypt'));

app.use(controlBaseDeDatos)
app.use(session({
  store: almacenSessiones,
  secret: process.env.SECRET,
  name: 'VitiniID',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    maxAge: duracionGlobalSessionCliente,
    sameSite: true,
    expires: duracionGlobalSessionCliente,
    httpOnly: true
  },
  rolling: true,
}));
//app.use(controlBaseDeDatos);


//Rutas dinamicas
app.use(router);


app.use((err, entrada, salida, next) => {
  if (entrada.method !== 'POST' && entrada.method !== 'GET') {
    const error = {
      error: "Casa Vitini solo maneja peticiones GET y POST"
    };
    salida.json(error);
  }
});

// Manejador de errores 404
app.use((entrada, salida) => {
  const URL = entrada.url;
  const Respuesta = {
    casaVitini: "Error 404",
    Info: "Por favor revisa la dirección introducida por que no existe",
    URL: URL
  }
  salida.status(404).json(Respuesta);
});

// Inicio de esucha de eventos HTTP
const puerto = process.env.PORT_HTTP
const puertoSec = process.env.PORT_HTTPS
const entorno = process.env.ENTORNO_DB

const infoEntornoDB = () => {
  console.info("Entorno DB:", entorno)
}

const info = () => {
  console.info("Casa Vitini dice Hola!")
}

app.listen(puerto, (entrada, Salida) => {
  console.info(">> Puerto inseguro activo:", puerto)
})

const certificado = 'certificadosSSL/live/lripoll.ddns.net/cert.pem'
const llave = "certificadosSSL/live/lripoll.ddns.net/privkey.pem"

const options = {
  key: fs.readFileSync(llave),
  cert: fs.readFileSync(certificado),
};


const servidorHTTPS = https.createServer(options, app).listen(puertoSec, (entrada, salida) => {
  console.info(">> Puerto seguro activo", puertoSec)
  infoEntornoDB();
  info();
});

fs.watchFile(llave, (curr, prev) => {
  console.info('Los certificados han cambiado. Recargando...');
  const newOptions = {
    key: fs.readFileSync(llave),
    cert: fs.readFileSync(certificado),
  };
  servidorHTTPS.setSecureContext(newOptions);
  console.info('Servidor HTTPS actualizado');
});



Object.keys(process.env).forEach((key) => {
  delete process.env[key];
});