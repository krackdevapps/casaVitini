import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";


export const cambiarPernoctanteDeHabitacion = async (entrada, salida) => {
    const mutex = new Mutex();
    const bloqueoCambiarPernoctanteHabitacion = await mutex.acquire();
    try {
        const reserva = entrada.body.reserva;
        const habitacionDestino = entrada.body.habitacionDestino;
        const pernoctanteUID = entrada.body.pernoctanteUID;
        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
            const error = "La reserva no se puede modificar por que esta pagada";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
            const error = "La reserva no se puede modificar por que esta reembolsada";
            throw new Error(error);
        }
        const consultaExistenciaCliente = `
                        SELECT 
                        "pernoctanteUID" 
                        FROM
                         "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`;
        const controlExistencia = await conexion.query(consultaExistenciaCliente, [reserva, pernoctanteUID]);
        if (controlExistencia.rowCount === 0) {
            const error = "No existe el pernoctante, por lo tanto no se puede mover de habitacion";
            throw new Error(error);
        }
        const consultaControlUnicoCliente = `
                            SELECT 
                            "pernoctanteUID" 
                            FROM
                            "reservaPernoctantes" 
                            WHERE
                            reserva = $1 AND habitacion = $2 AND "pernoctanteUID" = $3;
                            `;
        const seleccionaClienteOrigen = await conexion.query(consultaControlUnicoCliente, [reserva, habitacionDestino, pernoctanteUID]);
        if (seleccionaClienteOrigen.rowCount > 0) {
            const error = "Ya existe el cliente en esta habitacion";
            throw new Error(error);
        }
        const actualizaNuevaPosicionClientePool = `
                            UPDATE 
                            "reservaPernoctantes"
                            SET
                            habitacion = $1
                            WHERE
                            reserva = $2 AND "pernoctanteUID" = $3;
                            `;
        const actualizaClientePoolDestino = await conexion.query(actualizaNuevaPosicionClientePool, [habitacionDestino, reserva, pernoctanteUID]);
        if (actualizaClientePoolDestino.rowCount === 0) {
            const error = "Ha ocurrido un error al intentar actualiza el cliente pool en el destino";
            throw new Error(error);
        }
        if (actualizaClientePoolDestino.rowCount === 1) {
            const ok = {
                ok: "Se ha cambiado correctamente al pernoctante de alojamiento dentro de la reserva "
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        bloqueoCambiarPernoctanteHabitacion();
    }
}