import { conexion } from "../../../../componentes/db.mjs"

export const eliminarCamaComoEntidadPorTestingVI = async (testingVI) => {

    try {
        const consulta = `
        DELETE FROM "camas"
        WHERE "testingVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}