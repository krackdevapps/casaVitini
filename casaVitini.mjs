import express from 'express';
import path from 'path';
import { router } from './routes/rutas.mjs'
import fs from 'fs';
import https from 'https';
import { controlHTTPS } from './logica/componentes/controlHttps.mjs'
import { controlBaseDeDatos } from './middleware/controlBaseDeDatos.mjs';
import { controlSizePeticion } from './middleware/controlSizePeticion.mjs';
import { controlJSON } from './middleware/controlJSON.mjs';
import { controlTipoVerbo } from './middleware/controlTipoVerbo.mjs';
import { manejador404 } from './middleware/manejador404.mjs';
import dotenv from 'dotenv'
import { configuracionSession } from './middleware/almacenSessiones.mjs';
import { detectorDeLlavesRepetidas } from './middleware/detectorDeLlavesRepetidas.mjs';
import { controlInputRaw } from './middleware/controlInputRaw.mjs';
import { jsonHeader } from './middleware/jsonHeader.mjs';
dotenv.config()

process.on('uncaughtException', (error) => {
  console.error('Alerta! ->>:', error.message);
});

const app = express()
app.use(controlHTTPS)
//app.use(controlInputRaw)
app.set('views', './ui/constructor')
app.set('view engine', 'ejs')
app.use(controlSizePeticion);
app.use(jsonHeader)
app.use(express.json({ limit: '50MB', extended: true }))
app.use(controlJSON)
app.use(express.urlencoded({ extended: true }))
app.use(express.raw({ limit: '50MB' }))
app.use(controlTipoVerbo)
app.set('trust proxy', true)
app.disable('x-powered-by')
app.use('/componentes', express.static(path.join('./ui/componentes')))
app.use(controlBaseDeDatos)
app.use(configuracionSession)
app.use(router)
app.use(manejador404)
export default app

const puerto = process.env.PORT_HTTP
const puertoSec = process.env.PORT_HTTPS
const entorno = process.env.ENTORNO_DB
const llave = process.env.CERTIFICADOS_KEY
const cert = process.env.CERTIFICADOS_CERT

const options = {
  key: fs.readFileSync(llave),
  cert: fs.readFileSync(cert),
}
console.info("db:", entorno)
app.listen(puerto, (entrada, Salida) => {
  console.info("http:", puerto)
})
https.createServer(options, app).listen(puertoSec, (entrada, salida) => {
  console.info("https", puertoSec)
  console.info("Casa Vitini dice Hola!")
})
