import { conexion } from "../../componentes/db.mjs";

export const obtenerApartamentoComoEntidadPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM apartamentos
        WHERE apartamento = $1;`;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}