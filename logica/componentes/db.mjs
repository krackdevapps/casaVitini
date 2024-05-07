import pkg from 'pg';
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
let BaseDeDatos
const entorno = process.env.ENTORNO_DB
if (entorno === "nativo") {
    BaseDeDatos = {
        host: 'localhost',
        user: process.env.BASEDEDATOS_USER,
        password: "hola",
        database: "casaVitiniDev",
        //revisar esto
        max: 100,
        port: 5432,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 3000,
    }
}
if (entorno === "docker") {
    BaseDeDatos = {
        host: 'nodobasededatos',
        user: process.env.BASEDEDATOS_USER,
        password: process.env.BASEDEDATOS_PASS,
        database: process.env.BASEDEDATOS_DBNAME,
        max: 100,
        port: 5432,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 3000,
    }
}
const conexion = new Pool(BaseDeDatos);
conexion.on('error', (error) => {
    console.error('Error en la conexión a la base de datos:', error.message);
  });
export { conexion };
