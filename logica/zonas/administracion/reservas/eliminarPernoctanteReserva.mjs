import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";


export const eliminarPernoctanteReserva = async (entrada, salida) => {
    const mutex = new Mutex();
    const bloqueoEliminarPernoctanteReserva = await mutex.acquire();
    try {
        const reserva = entrada.body.reserva;
        const pernoctanteUID = entrada.body.pernoctanteUID;
        const tipoElinacion = entrada.body.tipoEliminacion;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
            const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (typeof tipoElinacion !== "string" || (tipoElinacion !== "habitacion" && tipoElinacion !== "reserva")) {
            const error = "El campo 'tipoElinacion' solo puede ser 'habitacion' o 'reserva'";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Comprobar que la reserva exisste
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
        // validar habitacion
        const validarCliente = `
                            SELECT 
                            "pernoctanteUID"
                            FROM
                            "reservaPernoctantes"
                            WHERE
                            reserva = $1 AND "pernoctanteUID" = $2
                            `;
        const resuelveValidarCliente = await conexion.query(validarCliente, [reserva, pernoctanteUID]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el pernoctante en la reserva";
            throw new Error(error);
        }
        const eliminaClientePool = `
                            DELETE FROM "poolClientes"
                            WHERE "pernoctanteUID" = $1;
                            `;
        await conexion.query(eliminaClientePool, [pernoctanteUID]);
        let sentenciaDinamica;
        if (tipoElinacion === "habitacion") {
            sentenciaDinamica = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND "pernoctanteUID" = $2 ;
                            `;
        }
        if (tipoElinacion === "reserva") {
            sentenciaDinamica = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE reserva = $1 AND "pernoctanteUID" = $2;
                            `;
        }
        const actualicarPernoctante = await conexion.query(sentenciaDinamica, [reserva, pernoctanteUID]);
        if (actualicarPernoctante.rowCount === 0) {
            const error = "No existe el pernoctante en la reserva, por lo tanto no se puede actualizar";
            throw new Error(error);
        }
        if (actualicarPernoctante.rowCount === 1) {
            let ok;
            if (tipoElinacion === "habitacion") {
                ok = {
                    "ok": "Se ha eliminado al pernoctante de la habitacion"
                };
            }
            if (tipoElinacion === "reserva") {
                ok = {
                    "ok": "Se ha eliminar al pernoctante de la reserva"
                };
            }
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        bloqueoEliminarPernoctanteReserva();
    }
}