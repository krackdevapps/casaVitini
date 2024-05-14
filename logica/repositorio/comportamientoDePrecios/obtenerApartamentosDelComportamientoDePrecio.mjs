import { conexion } from "../../componentes/db.mjs";
export const obtenerApartamentosDelComportamientoDePrecio = async (comportamientoUID) => {
    try {

        const consulta =`
        SELECT
        cpa.uid,
        cpa."apartamentoIDV",
        cpa."cantidad",
        cpa."comportamientoUID",
        a."apartamentoUI",
        cpa."simbolo"
        FROM 
        "comportamientoPreciosApartamentos" cpa
        JOIN
        apartamentos a ON cpa."apartamentoIDV" = a.apartamento
        WHERE "comportamientoUID" = $1;
        `;
   
        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se encontrado ningun apartamento para este comportamiento de precio";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
