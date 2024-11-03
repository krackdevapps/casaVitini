import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { actualizarHabitacionDelPernoctantePorComponenteUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/actualizarHabitacionDelPernoctantePorComponenteUID.mjs";
import { semaforoCompartidoReserva } from "../../../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const cambiarPernoctanteDeHabitacion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        await semaforoCompartidoReserva.acquire();


        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const habitacionDestinoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionDestinoUID,
            nombreCampo: "El identificador universal de la habitacionDestinoUID (habitacionDestinoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        if (reserva.estadoPagoIDV === "pagado") {
            const error = "La reserva no se puede modificar porque está pagada";
            throw new Error(error);
        }
        if (reserva.estadoPagoIDV === "reembolsado") {
            const error = "La reserva no se puede modificar porque está reembolsada.";
            throw new Error(error);
        }
        const pernoctanteDeLaReserva = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID,
            pernoctanteUID
        })
        if (!pernoctanteDeLaReserva?.componenteUID) {
            const error = "No existe el pernoctante, por lo tanto, no se puede mover de habitación";
            throw new Error(error);
        }
        await actualizarHabitacionDelPernoctantePorComponenteUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID,
            habitacionUID: habitacionDestinoUID
        })
        const ok = {
            ok: "Se ha cambiado correctamente al pernoctante de alojamiento dentro de la reserva "
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release()
        }
    }
}