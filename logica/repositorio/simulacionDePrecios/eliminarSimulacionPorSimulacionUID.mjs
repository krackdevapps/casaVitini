import { conexion } from "../../componentes/db.mjs";

export const eliminarSimulacionPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        DELETE FROM "simulacionesDePrecio"
        WHERE "simulacionUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [simulacionUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}