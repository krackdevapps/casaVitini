import { conexion } from "../../componentes/db.mjs";
export const obtenerApartamentosDelComportamientoPorComportamientoUID = async (comportamientoUID) => {
    try {

        const consulta =`
        SELECT
        *
        FROM 
        "comportamientoPreciosApartamentos"
        WHERE "comportamientoUID" = $1;
        `;
   
        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado ningún apartamento para este comportamiento de precio. Revisa el comportamientoUID";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
