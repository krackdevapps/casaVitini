import { conexion } from "../globales/db.mjs";

export const obtenerDatosPersonalesPorPasaporte = async (pasaporte) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "datosDeUsuario"
        WHERE
        pasaporte = $1;`;
        const resuelve = await conexion.query(consulta, [pasaporte]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}