import { conexion } from "../../componentes/db.mjs";
export const eliminarApartamentosDelComportamientoDePrecioPorComportamientoUID = async (comportamientoUID) => {
    try {
        const consulta = `
        DELETE FROM "comportamientoPreciosApartamentos"
        WHERE "comportamientoUID" = $1 ;
        `;
        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
