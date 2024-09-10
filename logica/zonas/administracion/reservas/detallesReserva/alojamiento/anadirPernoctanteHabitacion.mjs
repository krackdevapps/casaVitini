import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../../../repositorio/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { obtenerDetallesCliente } from "./../../../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { obtenerPernoctanteDeLaReservaPorClienteUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorClienteUID.mjs";
import { insertarPernoctanteEnLaHabitacion } from "../../../../../repositorio/reservas/pernoctantes/insertarPernoctanteEnLaHabitacion.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const anadirPernoctanteHabitacion = async (entrada) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
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

        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la clienteUID (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"

        })
        await campoDeTransaccion("iniciar")

        // Comprobar que la reserva exisste
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        // validar habitacion
        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID,
        })
        // validar cliente
        const cliente = await obtenerDetallesCliente(clienteUID)
        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
        const pernoctanteDeLaReserva = await obtenerPernoctanteDeLaReservaPorClienteUID({
            reservaUID,
            clienteUID
        })

        if (pernoctanteDeLaReserva.length > 0) {
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muévalo de habitación";
            throw new Error(error);
        }

        const nuevoPernoctanteEnLaHabitacion = await insertarPernoctanteEnLaHabitacion({
            reservaUID: reservaUID,
            clienteUID: clienteUID,
            habitacionUID: habitacionUID
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha añadido correctamente el cliente en la habitación de la reserva",
            pernoctante: nuevoPernoctanteEnLaHabitacion,
            cliente
        };
        return ok
    }
    catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}