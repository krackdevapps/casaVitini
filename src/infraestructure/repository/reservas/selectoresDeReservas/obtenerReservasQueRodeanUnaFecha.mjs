import { conexion } from "../../globales/db.mjs"

export const obtenerReservasQueRodeanUnaFecha = async (metadatos) => {
    try {
        const fechaReferencia = metadatos.fechaReferencia
        const estadosReservaIDV = ["pendiente", "confirmada"]
        const consultaReservas = `       
        SELECT 
        "reservaUID",
        to_char("fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada",
        to_char("fechaSalida", 'YYYY-MM-DD') AS "fechaSalida",
        "estadoReservaIDV",
        "estadoPagoIDV",
        "origenIDV",
        to_char("fechaCreacion", 'YYYY-MM-DD') AS "fechaCreacion",
        to_char("fechaCancelacion", 'YYYY-MM-DD') AS "fechaCancelacion"
        FROM
        reservas  
        WHERE                     
        (
        $1 BETWEEN "fechaEntrada" AND "fechaSalida"
        )
        AND "estadoReservaIDV" = ANY($2)
        `
        const parametros = [
            fechaReferencia,
            estadosReservaIDV
        ]
        const resuelve = await conexion.query(consultaReservas, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
