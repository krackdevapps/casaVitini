import { conexion } from "../../componentes/db.mjs";
export const eliminarComportamientoPorComportamientoTVI = async (comportamientoTVI) => {
    try {

        const consulta = `
        DELETE FROM "comportamientoPrecios"
        WHERE "comportamientoTVI" = $1;
        `;
   
        const resuelve = await conexion.query(consulta, [comportamientoTVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
