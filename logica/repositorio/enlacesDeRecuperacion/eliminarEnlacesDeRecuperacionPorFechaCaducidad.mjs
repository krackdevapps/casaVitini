import { conexion } from "../../componentes/db.mjs";

export const eliminarEnlacesDeRecuperacionPorFechaCaducidad = async (fechaActual_ISO) => {
    try {
        const consulta = `
        DELETE FROM "enlaceDeRecuperacionCuenta"
        WHERE "fechaCaducidad" < $1;
        `;
        await conexion.query(consulta, [fechaActual_ISO]);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

