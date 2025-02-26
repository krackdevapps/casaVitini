import { conexion } from "../../globales/db.mjs"

export const obtenerReservaPendientesDeRevision = async (data) => {
    try {
        const estadoReserva = data.estadoReserva
        const consulta = `
        SELECT
            "reservaUID",
            to_char("fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada",
            to_char("fechaSalida", 'YYYY-MM-DD') AS "fechaSalida",
            "estadoReservaIDV",
            "estadoPagoIDV",
            "origenIDV",
            to_char("fechaCreacion",  'YYYY-MM-DD HH24:MI:SS.MS') AS "fechaCreacion",
            to_char("fechaCreacion",  'YYYY-MM-DD') AS "fechaCreacion_simple",
            to_char("fechaCancelacion",  'YYYY-MM-DD HH24:MI:SS.MS') AS "fechaCancelacion"
        FROM 
            reservas
        WHERE 
            "estadoReservaIDV" = $1
        ORDER BY 
            "fechaCreacion" ASC
        ;`;
        const resuelve = await conexion.query(consulta, [estadoReserva]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}