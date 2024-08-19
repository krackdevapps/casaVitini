import { conexion } from "../../componentes/db.mjs";

export const eliminarSimulacionPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM "simulacionesDePrecio"
        WHERE "testingVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}