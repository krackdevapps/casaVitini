import { conexion } from "../globales/db.mjs";


export const obtenerEnlacesRecuperacionPorUsuario = async (usuario) => {
    try {
        const consulta = `
        SELECT
        *
        FROM "enlaceDeRecuperacionCuenta"
        WHERE "usuario" = $1;`;


        const resuelve = await conexion.query(consulta, [usuario]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

