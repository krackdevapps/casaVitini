import { conexion } from "../../componentes/db.mjs";
export const eliminarApartamentosDelComportamientoDePrecio = async (comportamientoUID) => {
    try {
        const consulta = `
        DELETE FROM "comportamientoPreciosApartamentos"
        WHERE "comportamientoUID" = $1 ;
        `;
        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun comportamiento de precio con ese comportamientoUID, revisa el identificador";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
