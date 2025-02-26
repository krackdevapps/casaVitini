import { conexion } from "../globales/db.mjs";

export const obtenerDatosPersonales = async (usuario) => {
    try {
        const consulta = `
        SELECT
        usuario,
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        mail
        FROM 
        "datosDeUsuario"
        WHERE 
        usuario = $1;`;
        const resuelve = await conexion.query(consulta, [usuario]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}