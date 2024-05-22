import { conexion } from "../../componentes/db.mjs";
export const obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array = async (data) => {
    try {
        const apartamentoIDV_array = data.apartamentoIDV_array
        const comportamientoUID_array = data.comportamientoUID_array

        const consulta = `
        SELECT
        *
        FROM 
        "comportamientoPreciosApartamentos"
        WHERE 
        "comportamientoUID" = ANY($1)
        AND
        "apartamentoIDV" = ANY($2)
        ;`;
        const parametros = {
            comportamientoUID_array,
            apartamentoIDV_array
        }
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
