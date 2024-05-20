import { conexion } from "../../componentes/db.mjs";

export const eliminarEnlacesPDFPorCaducidad = async (fechaActual) => {
    try {
        const consulta = `
        DELETE FROM "enlacesPdf"
        WHERE caducidad < $1;`;

        const resuelve = await conexion.query(consulta, fechaActual)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}