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

        const reserva = validadoresCompartidos.tipos.numero({
            string: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const habitacionUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la reservhabitacionUIDa ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const resolverReserva = await validadoresCompartidos.reservas.validarReserva(reserva)
        if (resolverReserva.estadoReserva === "cancelada") {
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

        const nuevoCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico,
            notas: entrada.body.notas,
        };
        const datosValidados = await validadoresCompartidos.clientes.validarCliente(nuevoCliente);

        const nuevoClienteInsertado = await insertarCliente(datosValidados);
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