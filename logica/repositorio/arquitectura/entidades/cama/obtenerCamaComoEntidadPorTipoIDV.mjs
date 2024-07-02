import { conexion } from "../../../../componentes/db.mjs"
export const obtenerCamaComoEntidadPorTipoIDV = async (tipoIDV) => {
    try {
        const tipoIDV = data.tipoIDV
        const consulta =`
        SELECT *
        FROM camas 
        WHERE
        "tipoIDV" = $2;`
        const resuelve = await conexion.query(consulta, [tipoIDV])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
