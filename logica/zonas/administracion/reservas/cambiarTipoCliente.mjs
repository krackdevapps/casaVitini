import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const cambiarTipoCliente = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        mutex = new Mutex();
        await mutex.acquire();

        const reservaUID = entrada.body.reservaUID;
        const pernoctanteUID = entrada.body.pernoctanteUID;
        const clienteUID = entrada.body.clienteUID;
        const reserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
            const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
            const error = "El campo 'clienteUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (reserva.estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        // validar cliente
        const validacionCliente = `
                          SELECT 
                          uid,
                          nombre,
                          "primerApellido",
                          "segundoApellido",
                          pasaporte
                          FROM 
                          clientes
                          WHERE 
                          uid = $1;
                          `;
        const resuelveValidacionCliente = await conexion.query(validacionCliente, [clienteUID]);
        if (resuelveValidacionCliente.rowCount === 0) {
            const error = "No existe el cliente";
            throw new Error(error);
        }
        const nombre = resuelveValidacionCliente.rows[0].nombre;
        const primerApellido = resuelveValidacionCliente.rows[0].primerApellido || "";
        const segundoApellido = resuelveValidacionCliente.rows[0].segundoApellido || "";
        const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
        const pasaporte = resuelveValidacionCliente.rows[0].segundoApellido;
        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
        const validacionUnicidadPernoctante = `
                          SELECT 
                          "pernoctanteUID"
                          FROM "reservaPernoctantes"
                          WHERE "clienteUID" = $1 AND reserva = $2
                          `;
        const resuelveValidacionUnicidadPernoctante = await conexion.query(validacionUnicidadPernoctante, [clienteUID, reservaUID]);
        if (resuelveValidacionUnicidadPernoctante.rowCount === 1) {
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion";
            throw new Error(error);
        }
        const consultaFechaFeserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM reservas 
                        WHERE reserva = $1;`;
        const resuelveFechas = await conexion.query(consultaFechaFeserva, [reservaUID]);
        const fechaEntrada_ISO = resuelveFechas.rows[0].fechaEntrada_ISO;
        const fechaSalida_ISO = resuelveFechas.rows[0].fechaSalida_ISO;
        const estadoReservaCancelado = "cancelada";
        const consultaReservasRangoInteracion = `
                        SELECT reserva 
                        FROM reservas 
                        WHERE entrada <= $1::DATE AND salida >= $2::DATE AND "estadoReserva" <> $3;`;
        const resuelveConsultaReservasRangoInteracion = await conexion.query(consultaReservasRangoInteracion, [fechaEntrada_ISO, fechaSalida_ISO, estadoReservaCancelado]);
        let interruptorClienteEncontrado;
        if (resuelveConsultaReservasRangoInteracion.rowCount > 0) {
            const reservas = resuelveConsultaReservasRangoInteracion.rows;
            for (const reserva of reservas) {
                const reservaUID = reserva.reserva;
                const buscarClienteEnOtrasReservas = `
                                SELECT "clienteUID" 
                                FROM "reservaPernoctantes" 
                                WHERE "clienteUID" = $1 AND reserva = $2;`;
                const resuelveBuscarClienteEnOtrasReservas = await conexion.query(buscarClienteEnOtrasReservas, [clienteUID, reservaUID]);
                if (resuelveBuscarClienteEnOtrasReservas.rowCount === 1) {
                    interruptorClienteEncontrado = "encontrado";
                    break;
                }
            }
        }
        if (interruptorClienteEncontrado === "encontrado") {
            const error = "Este cliente no se puede anadir a esta reserva por que esta en otra reserva cuyo rango de fecha coincide con esta, dicho de otra manera, si se anadiese este cliente en esta reserva, puede que en un dia o en mas de un dia este cliente estaria asignado a un apartmento distingo en fechas coincidentes";
            throw new Error(error);
        }
        const cambiarClientePoolPorCliente = `
                        UPDATE "reservaPernoctantes"
                        SET "clienteUID" = $1
                        WHERE 
                        "pernoctanteUID" = $2 AND
                        reserva = $3
                        RETURNING
                        habitacion;`;
        const clientePoolResuelto = await conexion.query(cambiarClientePoolPorCliente, [clienteUID, pernoctanteUID, reservaUID]);
        if (clientePoolResuelto.rowCount === 0) {
            const error = "revisa los parametros que introduces por que aunque estan escritos en el formato correcto pero no son correctos";
            throw new Error(error);
        }
        const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`;
        await conexion.query(eliminarClientePool, [pernoctanteUID]);
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha acualizado el pernoctante correctamente",
            pernoctanteUID: pernoctanteUID,
            habitacionUID: clientePoolResuelto.rows[0].habitacion,
            nombreCompleto: nombreCompleto,
            pasaporte: pasaporte
        };
        salida.json(ok);
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