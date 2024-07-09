import { DateTime } from 'luxon';
import { apartamentosOcupadosAirbnb } from '../calendariosSincronizados/airbnb/apartamentosOcudaosAirbnb.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { obtenerBloqueosPorRangoPorApartamentoIDV } from '../../repositorio/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs';
import { obtenerReservasPorRango } from '../../repositorio/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs';
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from '../../repositorio/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs';

export const apartamentosPorRango = async (data) => {

    const fechaEntrada = data.fechaEntrada
    const fechaSalida = data.fechaSalida
    const apartamentosIDV = data.apartamentosIDV
    const zonaConfiguracionAlojamientoArray = data.zonaConfiguracionAlojamientoArray
    const zonaBloqueo_array = data.zonaBloqueo_array

    try {

        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva en apartamentosPorRango"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida,
            nombreCampo: "La fecha de salida de la reserva en apartamentosPorRango"
        })
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada); // El formato es día/mes/ano
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida);
        if (fechaEntrada_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        const apartamentosDisponiblesArray = []
        const reservas = await obtenerReservasPorRango({
            fechaIncioRango_ISO: fechaEntrada,
            fechaFinRango_ISO: fechaSalida,
        })

        const apartamentosIDVBloqueados = []

        const bloqueos = await obtenerBloqueosPorRangoPorApartamentoIDV({
            fechaInicioRango: fechaEntrada,
            fechaFinRango: fechaSalida,
            apartamentosIDV_array: apartamentosIDV,
            zonaBloqueoIDV_array: zonaBloqueo_array
        })

        bloqueos.forEach((apartamento) => {
            apartamentosIDVBloqueados.push(apartamento.apartamentoIDV)
        })


        for (const reserva of reservas) {
            const reservaUID = reserva.reservaUID
            const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)

            apartamentosDeLaReserva.forEach((apartamentoDeLaReserva) => {
                const apartamentoIDV = apartamentoDeLaReserva.apartamentoIDV
                apartamentosIDVBloqueados.push(apartamentoIDV)
            })
        }
        const configuracionesAlojamientoSoloDisponible = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "disponible",
            zonaArray: zonaConfiguracionAlojamientoArray
        })
        if (configuracionesAlojamientoSoloDisponible.length === 0) {
            const error = "No hay ningun apartamento disponible"
            throw new Error(error)
        }
        const configuracionesAlojamientoNODisponibles = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "nodisponible",
            zonaArray: zonaConfiguracionAlojamientoArray
        })

        configuracionesAlojamientoNODisponibles.forEach((apartamentoNoDisponible) => {
            apartamentosIDVBloqueados.push(apartamentoNoDisponible.apartamentoIDV)
        })

        configuracionesAlojamientoSoloDisponible.forEach((apartamento) => {
            apartamentosDisponiblesArray.push(apartamento.apartamentoIDV)
        })


        const apartamentosNoDisponiblesArray = Array.from(new Set(apartamentosIDVBloqueados));
        const apartamentosDisponiblesFinal = apartamentosDisponiblesArray.filter(apartamento => !apartamentosNoDisponiblesArray.includes(apartamento));

        const datosAirbnb = {
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosDisponibles: apartamentosDisponiblesFinal,
        }

        const apartamentosOcupadosPorEliminar_Airbnb = await apartamentosOcupadosAirbnb(datosAirbnb)

        for (const apartamentoIDV of apartamentosOcupadosPorEliminar_Airbnb) {
            const elementoParaBorrar = apartamentosDisponiblesFinal.indexOf(apartamentoIDV);
            if (elementoParaBorrar !== -1) {
                apartamentosDisponiblesFinal.splice(elementoParaBorrar, 1);
                apartamentosNoDisponiblesArray.push(apartamentoIDV)
            }
        }

        const ok = {
            apartamentosNoDisponibles: apartamentosNoDisponiblesArray,
            apartamentosDisponibles: apartamentosDisponiblesFinal,
            detalles: "Se esta teniendo en cuenta, los apartamentos en reservas y los apartamentos no disponbiles definidos por la configuración global de alojamiento"
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
