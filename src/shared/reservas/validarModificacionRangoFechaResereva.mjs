import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { obtenerReservaPorReservaUID } from '../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { validadorFuturo } from './rangoFlexible/futuro.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs';
import { validadorPasado } from './rangoFlexible/pasado.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from '../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs';
export const validarModificacionRangoFechaResereva = async (data) => {
    try {
        const mesCalendario = data.mesCalendario.padStart(2, '0');
        const anoCalendario = data.anoCalendario.padStart(2, '0');
        const sentidoRango = data.sentidoRango
        const reservaUID = data.reservaUID

        validadoresCompartidos.fechas.cadenaAno(anoCalendario)
        validadoresCompartidos.fechas.cadenaMes(mesCalendario)

        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro"
            throw new Error(error)
        }

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoPago = reserva.estadoPagoIDV

        if (estadoPago === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada."
            throw new Error(error)
        }
        const fechaEntradaReserva_ISO = reserva.fechaEntrada
        const fechaSalidaReserva_ISO = reserva.fechaSalida

        const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosReservaActual = apartamentosDeLaReserva.map((apartamento) => {
            return apartamento.apartamentoIDV
        })
        const apartamentosConConfiguracionDisponible = []

        const configuracionesApartamentosSoloDiponibles = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "activado",
            zonaArray: ["publica", "global", "privada"]
        })
        configuracionesApartamentosSoloDiponibles.forEach((apartamentoConConfiguracionDisponible) => {
            apartamentosConConfiguracionDisponible.push(apartamentoConConfiguracionDisponible.apartamentoIDV)
        })
        const controlConfiguracionAlojamiento = apartamentosReservaActual.every(apto => apartamentosConConfiguracionDisponible.includes(apto));

        if (!controlConfiguracionAlojamiento) {
            const elementosNoComunes = apartamentosReservaActual.filter(elemento => !apartamentosConConfiguracionDisponible.includes(elemento));
            const arrayStringsPrePresentacionDatos = []

            for (const apartamentoIDV of elementosNoComunes) {
                const apartamento = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
                    apartamentoIDV: apartamentoIDV,
                    reservaUID: reservaUID,
                    errorSi: "desactivado"
                })
                const apartamentoUI = apartamento.apartamentoUI
                const nombreUI = `${apartamentoUI} (IDV: ${apartamentoIDV})`
                arrayStringsPrePresentacionDatos.push(nombreUI)
            }

            const ultimoElemento = arrayStringsPrePresentacionDatos.pop();
            const constructorCadenaFinalUI = arrayStringsPrePresentacionDatos.join(", ") + (arrayStringsPrePresentacionDatos.length > 0 ? " y " : "") + ultimoElemento;

            const error = "No se puede comprobar la elasticidad del rango de esta reserva por que hay apartamentos que no existen en la configuración de alojamiento o están en No disponible. Dicho de otra manera, esta reserva tiene apartamentos que ya no existen como configuración de alojamiento o tienen un estado No disponible. Puede que esta reserva se hiciera cuando existían unas configuraciones de alojamiento que ahora ya no existen, concretamente hablamos de los apartamentos: " + constructorCadenaFinalUI
            throw new Error(error)
        }

        if (sentidoRango === "pasado") {
            const pasado = await validadorPasado({
                anoCalendario: anoCalendario,
                mesCalendario: mesCalendario,
                reservaUID,
                fechaEntradaReserva_ISO: fechaEntradaReserva_ISO,
                fechaSalidaReserva_ISO: fechaSalidaReserva_ISO,
                apartamentosReservaActual: apartamentosReservaActual,
            })
            return pasado
        }

        if (sentidoRango === "futuro") {
            const futuro = await validadorFuturo({
                anoCalendario: anoCalendario,
                mesCalendario: mesCalendario,
                reservaUID,
                fechaEntradaReserva_ISO: fechaEntradaReserva_ISO,
                fechaSalidaReserva_ISO: fechaSalidaReserva_ISO,
                apartamentosReservaActual: apartamentosReservaActual,
            })
            return futuro
        }

    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
