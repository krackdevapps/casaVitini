import { conexion } from "../../componentes/db.mjs";

export const estadoDeAcceso = async () => {
    try {
        await conexion.query("SELECT 1");
    } catch (error) {
        throw error
    }
}

