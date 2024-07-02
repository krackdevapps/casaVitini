import { conexion } from "../../../../componentes/db.mjs"
export const obtenerTodasLasCamaPorTipoIDV = async (tipoIDV) => {
    try {
        const consulta = `
        SELECT *
        FROM camas
        WHERE
        "tipoIDV" = $1`
        const resuelve = await conexion.query(consulta, [tipoIDV])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
