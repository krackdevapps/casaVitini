import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const anadirPernoctanteHabitacion = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        mutex = new Mutex();
        await mutex.acquire();

        const reserva = entrada.body.reserva;
        const habitacionUID = entrada.body.habitacionUID;
        const clienteUID = entrada.body.clienteUID;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (typeof habitacionUID !== "number" || !Number.isInteger(habitacionUID) || habitacionUID <= 0) {
            const error = "el campo 'habitacionUID' solo puede un numero, entero y positivo";
            throw new Error(error);
        }
        if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
            const error = "el campo 'clienteUID' solo puede un numero, entero y positivo";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Comprobar que la reserva exisste
        const validacionReserva = `
                        SELECT 
                        reserva,
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva",
                        "estadoPago"
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
        const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `;
        const resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacionUID]);
        if (resuelveValidacionHabitacion.rowCount === 0) {
            const error = "No existe la habitacion dentro de esta reserva";
            throw new Error(error);
        }
        // validar cliente
        const validacionCliente = `
                        SELECT 
                        uid
                        FROM clientes
                        WHERE uid = $1
                        `;
        const resuelveValidacionCliente = await conexion.query(validacionCliente, [clienteUID]);
        if (resuelveValidacionCliente.rowCount === 0) {
            const error = "No existe el cliente";
            throw new Error(error);
        }
        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
        const validacionUnicidadPernoctante = `
                        SELECT 
                        "pernoctanteUID"
                        FROM "reservaPernoctantes"
                        WHERE "clienteUID" = $1 AND reserva = $2
                        `;
        const resuelveValidacionUnicidadPernoctante = await conexion.query(validacionUnicidadPernoctante, [clienteUID, reserva]);
        if (resuelveValidacionUnicidadPernoctante.rowCount === 1) {
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion";
            throw new Error(error);
        }
        const insertarClienteExistenteEnReserva = `
                        INSERT INTO "reservaPernoctantes"
                        (
                        reserva,
                        habitacion,
                        "clienteUID"
                        )
                        VALUES ($1, $2,$3) RETURNING "pernoctanteUID"
                        `;
        const resuelveInsertarClienteExistenteEnReserva = await conexion.query(insertarClienteExistenteEnReserva, [reserva, habitacionUID, clienteUID]);
        if (resuelveInsertarClienteExistenteEnReserva.rowCount === 1) {
            const ok = {
                ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
                nuevoUID: resuelveInsertarClienteExistenteEnReserva.rows[0].pernoctanteUID
            };
            salida.json(ok);
        }
        if (resuelveInsertarClienteExistenteEnReserva.rowCount === 0) {
            const error = "Ha ocurrido un error al final del proceso y no se ha anadido el cliente";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {

        if (mutex) {
            mutex.release()
        }
    }
}