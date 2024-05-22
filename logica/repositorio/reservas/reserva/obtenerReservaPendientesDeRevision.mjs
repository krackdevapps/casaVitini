import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservaPendientesDeRevision = async (data) => {
    try {
        const origen = data.origen
        const estadoPago = data.estadoPago
        const estadoReserva = data.estadoReserva
        const consulta = `
        SELECT
            r.reserva,
            to_char(r.entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(r.salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
            to_char(r.creacion, 'DD/MM/YYYY HH24:MI:SS') AS "fechaCreacion_ISO",
            rt."totalConImpuestos"
        FROM 
            reservas r
        JOIN
           "reservaTotales" rt ON r.reserva = rt.reserva
        WHERE 
            r.origen = $1 AND
            r."estadoPago" = $2 AND
            r."estadoReserva" = $3
        ORDER BY 
            r.creacion ASC
        ;`;
        const parametros = [
            origen,
            estadoPago,
            estadoReserva
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

