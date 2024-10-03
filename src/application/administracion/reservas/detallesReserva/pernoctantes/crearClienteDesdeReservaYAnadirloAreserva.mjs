import { Mutex } from "async-mutex";
import { insertarCliente } from "../../../../../infraestructure/repository/clientes/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { insertarPernoctanteEnLaHabitacion } from "../../../../../infraestructure/repository/reservas/pernoctantes/insertarPernoctanteEnLaHabitacion.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const crearClienteDesdeReservaYAnadirloAreserva = async (entrada) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 9
        })
        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacionUID (habitacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const resolverReserva = await obtenerReservaPorReservaUID(reservaUID)
        if (resolverReserva.estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }

        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })


        const datosValidados = await validadoresCompartidos.clientes.validarCliente({
            cliente: {
                nombre: entrada.body.nombre,
                primerApellido: entrada.body.primerApellido,
                segundoApellido: entrada.body.segundoApellido,
                pasaporte: entrada.body.pasaporte,
                telefono: entrada.body.telefono,
                correoElectronico: entrada.body.correoElectronico,
                notas: entrada.body.notas,
            },
            operacion: "crear"

        });

        const nuevoCliente = await insertarCliente(datosValidados);
        const nuevoUIDCliente = nuevoCliente.clienteUID;

        const nuevoPernoctaneInsertado = await insertarPernoctanteEnLaHabitacion({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID,
            clienteUID: nuevoUIDCliente
        })
        const ok = {
            ok: "Se ha añadido correctamente el cliente en la habitación de la reserva",
            nuevoUIDPernoctante: nuevoPernoctaneInsertado.componenteUID,
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
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}