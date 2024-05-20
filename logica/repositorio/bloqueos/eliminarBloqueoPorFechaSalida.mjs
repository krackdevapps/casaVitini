import { conexion } from "../../componentes/db.mjs";

export const eliminarBloqueoPorFechaSalida = async (fechaActual_ISO) => {
    try {
        const consulta = `
        DELETE FROM "bloqueosApartamentos"
        WHERE salida < $1;
        `;

        await conexion.query(consulta, [fechaActual_ISO])
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}