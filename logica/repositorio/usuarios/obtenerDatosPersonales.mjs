import { conexion } from "../../componentes/db.mjs";

export const obtenerDatosPersonales = async (usuario) => {
    try {
        const consulta = `
        SELECT 
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        email
        FROM 
        "datosDeUsuario"
        WHERE 
        usuario = $1;`;
        const resuelve = await conexion.query(consulta, [usuario]);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}