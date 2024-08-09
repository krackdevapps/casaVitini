import { conexion } from "../../componentes/db.mjs";
export const obtenerApartamentosDelComportamientoPorComponenteUID = async (componenteUID) => {
    try {

        const consulta =`
        SELECT
        *
        FROM 
        "comportamientoPreciosApartamentos"
        WHERE "componenteUID" = $1;
        `;
   
        const resuelve = await conexion.query(consulta, [componenteUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado el apartamento para este comportamiento de precio. Revisa el componenteUID";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
