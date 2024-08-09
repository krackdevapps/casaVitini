import { conexion } from "../../../../componentes/db.mjs"

export const obtenerApartamentoComoEntidadPorApartamentoUI = async (data) => {
    try {
        const apartamentoUI = data.apartamentoUI
        const errorSi = data.errorSi

        const consulta =  `
        SELECT
        *
        FROM apartamentos
        WHERE lower("apartamentoUI") = lower($1);`;
        const resuelve = await conexion.query(consulta, [apartamentoUI]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra ningún apartamento como entidad con ese apartmentoUI"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un apartamento como entidad con ese apartmentoUI"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerApartamentoComoEntidadPorApartamentoUI necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}