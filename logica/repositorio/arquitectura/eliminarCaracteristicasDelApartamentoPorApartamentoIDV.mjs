import { conexion } from "../../componentes/db.mjs";

export const eliminarCaracteristicasDelApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {

        const consulta =`
        DELETE FROM "apartamentosCaracteristicas"
        WHERE "apartamentoIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve 
    } catch (errorAdaptador) {
        const error = "Error en el adaptador eliminarCaracteristicasDelApartamentoPorApartamentoIDV"
        throw new Error(error)
    }

}