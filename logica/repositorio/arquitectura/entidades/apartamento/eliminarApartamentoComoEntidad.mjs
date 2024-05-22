import { conexion } from "../../../../componentes/db.mjs"

export const eliminarApartamentoComoEntidad = async (apartamentoIDV) => {
    try {

        const consulta = `
        DELETE FROM apartamentos
        WHERE "apartamentoIDV" = $1;
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}