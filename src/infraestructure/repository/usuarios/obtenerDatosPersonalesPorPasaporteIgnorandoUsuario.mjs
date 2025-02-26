import { conexion } from "../globales/db.mjs";

export const obtenerDatosPersonalesPorPasaporteIgnorandoUsuario = async (data) => {
    try {

        const pasaporte = data.pasaporte
        const usuario = data.usuario

        const consulta = `
        SELECT 
        *
        FROM 
        "datosDeUsuario"
        WHERE
        pasaporte = $1
        AND
        usuario <> & $2;`;
        const paarametros = [
            pasaporte,
            usuario
        ]

        const resuelve = await conexion.query(consulta, paarametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}