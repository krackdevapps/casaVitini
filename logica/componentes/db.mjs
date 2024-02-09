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
        password: process.env.BASEDEDATOS_PASS,
        database: process.env.BASEDEDATOS_DBNAME,
        //revisar esto
        max: 100,
        port: 10000,
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
       /* ssl: {
            rejectUnauthorized: true,    // Habilita la verificación automática del certificado del servidor
            ca: caCert,                  // Especifica el certificado de tu CA para la verificación
            // Otros parámetros opcionales de SSL:
            // key: fs.readFileSync('ruta/a/la/clave_privada_cliente.key').toString(),  // Clave privada del cliente (si es necesaria)
            // cert: fs.readFileSync('ruta_al_certificado_cliente.crt').toString(),     // Certificado del cliente (si es necesario)
            // passphrase: 'contraseña_de_la_clave_privada',                            // Contraseña de la clave privada (si es necesaria)
            // checkServerIdentity: (hostname, cert) => { ... },                         // Verificación personalizada del certificado del servidor (si es necesaria)
          },*/
    }

}
const conexion = new Pool(BaseDeDatos);
conexion.on('error', (error) => {
    console.error('Error en la conexión a la base de datos:', error.message);
    // Puedes tomar acciones adicionales aquí, como intentar reconectar o cerrar la aplicación
  });
export { conexion };




