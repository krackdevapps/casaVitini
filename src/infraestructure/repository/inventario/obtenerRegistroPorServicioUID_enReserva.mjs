import { conexion } from "../globales/db.mjs";

export const obtenerRegsitroPorServicioUID_enReserva = async (servicioUID_enReserva) => {
    try {
        const consulta = `
        SELECT
        uid,
        "elementoUID",
        (SELECT nombre
        FROM "inventarioGeneral"
        WHERE "inventarioGeneral"."UID" = "inventarioGeneralRegistro"."elementoUID") AS "nombre",
        "operacionIDV",
        "cantidadEnMovimiento",
        fecha,
        "sentidoMovimiento"
        FROM
        "inventarioGeneralRegistro"
        WHERE
        "servicioUID_enReserva" = $1;
        `;
        const resuelve = await conexion.query(consulta, [servicioUID_enReserva]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún registro con ese identificador de registro";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}