
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { obtenerDetallesCliente } from "./../../../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { obtenerPernoctanteDeLaReservaPorClienteUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorClienteUID.mjs";
import { insertarPernoctanteEnLaHabitacion } from "../../../../../infraestructure/repository/reservas/pernoctantes/insertarPernoctanteEnLaHabitacion.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { semaforoCompartidoReserva } from "../../../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const anadirPernoctanteHabitacion = async (entrada) => {
    try {


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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacionUID (habitacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la clienteUID (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"

        })
        await campoDeTransaccion("iniciar")


        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }

        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID,
        })

        const cliente = await obtenerDetallesCliente(clienteUID)

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
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release()
        }
    }
}