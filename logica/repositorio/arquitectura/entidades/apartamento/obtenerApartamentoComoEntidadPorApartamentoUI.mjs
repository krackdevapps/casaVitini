import { conexion } from "../../../../componentes/db.mjs"

export const obtenerApartamentoComoEntidadPorApartamentoUI = async (apartamentoUI) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM apartamentos
        WHERE lower("apartamentoUI") = lower($1);`;
        const resuelve = await conexion.query(consulta, [apartamentoUI]);
        if (resuelve.rowCount === 0) {
            const error = "No se encunetra ningun apartamento como entdad con ese apartmentoUI"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}