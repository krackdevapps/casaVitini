import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosEnlaceDePago = async () => {
    try {
        const consulta = `
            SELECT
            "nombreEnlace", 
            codigo, 
            "reservaUID",
            descripcion,
            "estadoPagoIDV",
            TO_CHAR("fechaCaducidad" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "fechaCaducidad"
            FROM "enlacesDePago";`;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

