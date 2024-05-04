import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { insertarCliente } from "../../../sistema/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const crearClienteDesdeReservaYAnadirloAreserva = async (entrada, salida) => {
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
        const nombre = entrada.body.nombre;
        const primerApellido = entrada.body.primerApellido;
        const segundoApellido = entrada.body.segundoApellido;
        const pasaporte = entrada.body.pasaporte;
        const telefono = entrada.body.telefono;
        const correoElectronico = entrada.body.correoElectronico;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (typeof habitacionUID !== "number" || !Number.isInteger(habitacionUID) || habitacionUID <= 0) {
            const error = "el campo 'habitacionUID' solo puede un numero, entero y positivo";
            throw new Error(error);
        }
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
        const nuevoClientePorValidar = {
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            correoElectronico: correoElectronico,
        };
        const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClientePorValidar);
        const datosNuevoCliente = {
            nombre: datosValidados.nombre,
            primerApellido: datosValidados.primerApellido,
            segundoApellido: datosValidados.segundoApellido,
            pasaporte: datosValidados.pasaporte,
            telefono: datosValidados.telefono,
            correoElectronico: datosValidados.correoElectronico
        };
        const nuevoClienteInsertado = await insertarCliente(datosNuevoCliente);
        const nuevoUIDCliente = nuevoClienteInsertado.uid;
        const insertarPernoctante = `
                        INSERT INTO 
                        "reservaPernoctantes"
                        (
                        reserva,
                        habitacion,
                        "clienteUID"
                        )
                        VALUES ($1,$2,$3)
                        RETURNING
                        "pernoctanteUID"
                        `;
        const resuelveInsertarPernoctante = await conexion.query(insertarPernoctante, [reserva, habitacionUID, nuevoUIDCliente]);
        if (resuelveInsertarPernoctante.rowCount === 0) {
            const error = "No se ha insertardo el pernoctante en al reserva";
            throw new Error(error);
        }
        if (resuelveInsertarPernoctante.rowCount === 1) {
            const ok = {
                ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
                nuevoUIDPernoctante: resuelveInsertarPernoctante.rows[0].pernoctanteUID,
                nuevoUIDCliente: nuevoUIDCliente,
                nuevoCliente: {
                    nombre: datosValidados.nombre,
                    primerApellido: datosValidados.primerApellido,
                    segundoApellido: datosValidados.segundoApellido,
                    pasaporte: datosValidados.pasaporte,
                    telefono: datosValidados.telefono,
                    correoElectronico: datosValidados.correoElectronico
                }
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
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