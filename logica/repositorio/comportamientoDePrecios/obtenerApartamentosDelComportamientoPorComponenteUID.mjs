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
            const error = "No se encontrado el apartamento para este comportamiento de precio, revisa el componenteUID";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
