import { conexion } from "../../../../componentes/db.mjs"

export const obtenerApartamentoComoEntidadPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM apartamentos
        WHERE "apartamentoIDV" = $1;`;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra ningun apartamento como entidad con ese apartamentoIDV"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}