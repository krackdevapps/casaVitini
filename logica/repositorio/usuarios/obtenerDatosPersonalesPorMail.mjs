import { conexion } from "../../componentes/db.mjs";

export const obtenerDatosPersonalesPorMail = async (mail) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "datosDeUsuario"
        WHERE 
        mail = $1;`;
        const resuelve = await conexion.query(consulta, [mail]);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}