import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { obtenerReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { validadorFuturo } from './rangoFlexible/futuro.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from '../../repositorio/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs';
import { validadorPasado } from './rangoFlexible/pasado.mjs';
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
        // La fecha de entrada seleccionada no puede seer superior a la de la fecha de entrada de la reserva
        // extraer el rango y los apartamentos de la reserva actual

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoPago = reserva.estadoPagoIDV

        if (estadoPago === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada"
            throw new Error(error)
        }
        const fechaEntradaReserva_ISO = reserva.fechaEntrada
        const fechaSalidaReserva_ISO = reserva.fechaSalida

        const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosReservaActual = apartamentosDeLaReserva.map((apartamento) => {
            return apartamento.apartamentoIDV
        })
        const apartamentosConConfiguracionDisponible = []
        // consulta apartamentos NO diponibles en configuracion global

        const configuracionesApartamentosSoloDiponibles = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "disponible",
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
                const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV: apartamentoIDV,
                    errorSi: "desactivado"
                })
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
