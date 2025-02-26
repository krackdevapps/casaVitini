import { conexion } from "./db.mjs";

export const estadoDeAcceso = async () => {
    try {
     await conexion.query("SELECT 1");
      
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

