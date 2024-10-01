import { conexion } from "../globales/db.mjs";

export const eliminarEnlacesDeRecuperacionPorFechaCaducidad = async (fechaActual_ISO) => {
    try {
        const consulta = `
        DELETE FROM "enlaceDeRecuperacionCuenta"
        WHERE "fechaCaducidad" < $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [fechaActual_ISO]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

