import { conexion } from "../globales/db.mjs";

export const obtenerFaltaDeExistenciasIventario = async () => {
    try {
        const consulta = `
        SELECT
        *
        FROM
        "inventarioGeneral"
        WHERE
        (
        "cantidadMinima" > cantidad
        AND "tipoLimite" = 'conLimite')
        OR
        (
        cantidad <= 1
        AND "tipoLimite" = 'sinLimite'
        );
        `;
        const resuelve = await conexion.query(consulta, );
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún elemento en el inventario con ese elemenotUID.";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}