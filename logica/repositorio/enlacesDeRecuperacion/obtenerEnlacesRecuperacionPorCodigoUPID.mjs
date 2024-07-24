import { conexion } from "../../componentes/db.mjs";


export const obtenerEnlacesRecuperacionPorCodigoUPID = async (codigo) => {
    try {
        const consulta = `
        SELECT
        *
        FROM "enlaceDeRecuperacionCuenta"
        WHERE "codigoUPID" = $1;`;


        const resuelve = await conexion.query(consulta, [codigo]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

