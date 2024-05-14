import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../componentes/campoDeTransaccion.mjs";
import { obtenerHabitacionesDelLaReserva } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionesDelLaReserva.mjs";
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { obtenerPernoctanteDeLaReservaPorClienteUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorClienteUID.mjs";
import { insertarPernoctanteEnLaHabitacion } from "../../../repositorio/reservas/pernoctantes/insertarPernoctanteEnLaHabitacion.mjs";

export const anadirPernoctanteHabitacion = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const habitacionUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacionUID (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const clienteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la clienteUID (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await campoDeTransaccion("iniciar")

        // Comprobar que la reserva exisste
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // validar habitacion
        await obtenerHabitacionesDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID,
        })
        // validar cliente
        await obtenerDetallesCliente(clienteUID)
        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
        const pernoctanteDeLaReserva = await obtenerPernoctanteDeLaReservaPorClienteUID({
            reservaUID: reservaUID,
            clienteUID: clienteUID
        })
        if (pernoctanteDeLaReserva.componenteUID) {
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion";
            throw new Error(error);
        }

        const nuevoPernoctanteEnLaHabitacion = await insertarPernoctanteEnLaHabitacion({
            reservaUID: reservaUID,
            clienteUID: clienteUID,
            habitacionUID: habitacionUID
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
            nuevoUID: nuevoPernoctanteEnLaHabitacion.componenteUID
        };
        salida.json(ok);
    }
    catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}