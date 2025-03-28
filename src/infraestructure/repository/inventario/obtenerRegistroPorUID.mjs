import { conexion } from "../globales/db.mjs";

export const obtenerRegistroPorUID = async (data) => {
    try {
        const registroUID = data.registroUID
        const errorSi = data.errorSi

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
        uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [registroUID]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = `No se encuentra ningún registro con ese registroUID`
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un registro con ese registroUID"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerRegistroPorUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }

}