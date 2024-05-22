import { conexion } from "../../componentes/db.mjs";

export const estadoDeAcceso = async () => {
    try {
       const hola  = await conexion.query("SELECT 1");
       return hola
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

