import { conexion } from "../globales/db.mjs";

export const eliminarBloqueoPorTestingVI = async (testingVI) => {
    try {

        const consulta = `
        DELETE FROM "bloqueosApartamentos"
        WHERE "testingVI" = $1;
        `;

        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}