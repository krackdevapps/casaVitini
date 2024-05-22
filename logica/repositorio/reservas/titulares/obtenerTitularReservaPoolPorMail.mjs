import { conexion } from "../../../componentes/db.mjs";
export const obtenerTitularReservaPoolPorMail = async (mail) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        "poolTitularesReserva"
        WHERE
        "mail" = $1`;

        const resuelve = await conexion.query(consulta, [mail])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
