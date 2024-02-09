import { Conexion } from './db.mjs';


// Crear una tabla para almacenar las sesiones
const createTable = async () => {
  try {
    await Conexion.query(
      `CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);`
    );
  } catch (error) {
    
  }
  
};

// Borrar las sesiones caducadas
const pruneSessions = async () => {
  try {
    await Conexion.query(
      `DELETE FROM session
        WHERE expire < NOW();`
    );
  } catch (error) {
    
  }
};

// Almacenar la sesión en la base de datos
const storeSession = async (sid, sess, expire) => {
  try {
    await Conexion.query(
      `INSERT INTO session (sid, sess, expire)
        VALUES ($1, $2, $3)
        ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire;`,
      [sid, sess, expire]
    );
  } catch (error) {
    
  }
};

// Obtener la sesión de la base de datos
const getSession = async (sid) => {
  try {
    const result = await Conexion.query(
      `SELECT sess FROM session
        WHERE sid = $1
        AND expire > NOW();`,
      [sid]
    );

    return result.rows[0].sess;
  } catch (error) {
    
  }
};

// Borrar la sesión de la base de datos
const deleteSession = async (sid) => {
  try {
    await Conexion.query(
      `DELETE FROM session
        WHERE sid = $1;`,
      [sid]
    );
  } catch (error) {
    
  }
};

// Exportar todas las funciones
module.exports = {
  createTable,
  pruneSessions,
  storeSession,
  getSession,
  deleteSession
};
