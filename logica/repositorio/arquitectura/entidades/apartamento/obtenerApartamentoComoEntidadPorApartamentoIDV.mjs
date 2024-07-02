import { conexion } from "../../../../componentes/db.mjs"

export const obtenerApartamentoComoEntidadPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT
        *
        FROM apartamentos
        WHERE "apartamentoIDV" = $1`;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra ningun apartamento como entidad con ese apartamentoIDV"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un apartamento como entidad con ese apartamentoIDV"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerApartamentoComoEntidadPorApartamentoIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}