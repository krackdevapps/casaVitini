import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const obtener_reservas = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        // Obtener todas las reservas no pagadas de origen cliente
        const obtenerReservas = `
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
        const parametrosDeBusqueda = [
            "cliente",
            "noPagado",
            "confirmada"
        ];
        const resuelveReservasPendientes = await conexion.query(obtenerReservas, parametrosDeBusqueda);
        const reservasPendientes = resuelveReservasPendientes.rows;
        const ok = {
            ok: "Aquí tienes las reservas de origen publico pendientes por revisar",
            reservas: []
        };
        if (resuelveReservasPendientes.rowCount > 0) {
            ok.reservas.push(...reservasPendientes);
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}