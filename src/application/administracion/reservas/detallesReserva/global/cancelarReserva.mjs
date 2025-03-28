import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { bloquearApartamentos } from "../../../../../shared/bloqueos/bloquearApartamentos.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { eliminarEnlaceDePagoPorReservaUID } from "../../../../../infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorReservaUID.mjs";
import { DateTime } from "luxon";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { actualizarEstadoReservaYFechaCancelacionPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/actualizarEstadoReservaYFechaCancelacionPorReservaUID.mjs";
import { obtenerServiciosPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServiciosPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { sincronizarRegistros } from "../../../../../shared/reservas/detallesReserva/servicios/sincronizarRegistros.mjs";

export const cancelarReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const tipoBloqueoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueoIDV,
            nombreCampo: "El nombre de tipoBloqueoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoBloqueoIDV !== "rangoTemporal" && tipoBloqueoIDV !== "permanente" && tipoBloqueoIDV !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo";
            throw new Error(error);
        }
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva ya esta cancelada";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        await eliminarEnlaceDePagoPorReservaUID(reservaUID)
        const fechaEntrada = reserva.fechaEntrada;
        const fechaSalida = reserva.fechaSalida;

        const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)

        for (const apartamento of apartamentosDeLaReserva) {
            const metadatos = {
                reservaUID: reservaUID,
                apartamentoUID: apartamento.componenteUID,
                tipoBloqueoIDV: tipoBloqueoIDV,
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                zonaIDV: "publica",
                origen: "cancelacionDeReserva"
            };
            await bloquearApartamentos(metadatos);
        }
        const estadoReserva = "cancelada";
        const fechaCancelacion = DateTime.utc().toISO();


        const servicios_EnReserva = await obtenerServiciosPorReservaUID(reservaUID)
        for (const sER of servicios_EnReserva) {
            await sincronizarRegistros({
                servicioExistenteAccesible: sER
            })
        }

        await actualizarEstadoReservaYFechaCancelacionPorReservaUID({
            estadoReserva: estadoReserva,
            fechaCancelacion: fechaCancelacion,
            reservaUID: reservaUID
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "La reserva se ha cancelado correctamente"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    }
}