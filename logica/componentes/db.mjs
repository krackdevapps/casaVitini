import pkg from 'pg';
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
const configuracion = {}
const entorno = process.env.ENTORNO_DB

if (entorno === "nativo") {
    configuracion.host = 'localhost'
    configuracion.user = process.env.BASEDEDATOS_USER
    configuracion.password = "hola"
    configuracion.database = "casaVitiniDev"
    configuracion.max = 100
    configuracion.port = 5432
    configuracion.idleTimeoutMillis = 1000
    configuracion.connectionTimeoutMillis = 3000
} else if (entorno === "docker") {
    configuracion.host = 'nodobasededatos'
    configuracion.user = process.env.BASEDEDATOS_USER
    configuracion.password = process.env.BASEDEDATOS_PASS
    configuracion.database = process.env.BASEDEDATOS_DBNAME
    configuracion.max = 100
    configuracion.port = 5432
    configuracion.idleTimeoutMillis = 1000
    configuracion.connectionTimeoutMillis = 3000

} else {
    const errorMsg = "No se ha definido el tipo de entorno para la base de datos"
    throw new Error(errorMsg)
}
export const conexion = new Pool(configuracion);
conexion.on('error', (error) => {
    console.error('Error en la conexión a la base de datos:', error.message);
})
