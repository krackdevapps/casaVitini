import { conexion } from "../globales/db.mjs"

export const eliminarCalendarioSincronizadoPorTestingIV = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM "calendariosSincronizados"
        WHERE "testingVI" = $1
        RETURNING *;
        `;

        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
