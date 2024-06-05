import { DateTime } from 'luxon';
import { apartamentosOcupadosAirbnb } from '../calendariosSincronizados/airbnb/apartamentosOcudaosAirbnb.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles } from '../../repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles } from '../../repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles.mjs';
import { obtenerBloqueosPorRangoPorApartamentoIDV } from '../../repositorio/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs';
import { obtenerReservasPorRango } from '../../repositorio/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs';

export const apartamentosPorRango = async (metadatos) => {

    const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
    const fechaSalida_ISO = metadatos.fechaSalida_ISO
    const apartamentosIDV = metadatos.apartamentosIDV
    const origen = metadatos.origen || "plaza"
    const rol = metadatos.rol || ""

    try {

        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada_ISO,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida_ISO,
            nombreCampo: "La fecha de salida de la reserva"
        })
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO); // El formato es día/mes/ano
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
        if (fechaEntrada_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        const apartamentosDisponiblesArray = []
        const configuracionReservas = {
            fechaIncioRango_ISO: fechaEntrada_ISO,
            fechaFinRango_ISO: fechaSalida_ISO,
        }
        const reservas = await obtenerReservasPorRango(configuracionReservas)
        const apartametnosIDVBloqueoados = []
        const configuracionBloqueos = {
            fechaInicioRango_ISO: fechaEntrada_ISO,
            fechaFinRango_ISO: fechaSalida_ISO,
            apartamentoIDV: apartamentosIDV,
            zonaBloqueo_array: ["publico", "global"],
        }
        if (origen === "administracion"
            &&
            (rol === "administrador" || rol === "empleado")) {
            configuracionBloqueos.zonaBloqueo_array = ["privado", "global"]
        }
        const bloqueos = await obtenerBloqueosPorRangoPorApartamentoIDV(configuracionBloqueos)

        bloqueos.forEach((apartamento) => {
            apartametnosIDVBloqueoados.push(apartamento.apartamento)
        })
        for (const reserva of reservas) {
            const reservaUID = reserva["reserva"]
            const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
            apartamentosDeLaReserva.forEach((apartamentoDeLaReserva) => {
                const apartamentoIDV = apartamentoDeLaReserva.apartamentoIDV
                apartametnosIDVBloqueoados.push(apartamentoIDV)
            })

        }
        const configuracionesAlojamientoSoloDisponible = await obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles()
        if (configuracionesAlojamientoSoloDisponible.length === 0) {
            const error = "No hay ningun apartamento disponible"
            throw new Error(error)
        }
        const configuracionesAlojaminetoNODisponbiles = await obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles()
        configuracionesAlojaminetoNODisponbiles.forEach((apartamentoNoDisponible) => {
            apartametnosIDVBloqueoados.push(apartamentoNoDisponible.apartamentoIDV)
        })

        configuracionesAlojamientoSoloDisponible.forEach((apartamento) => {
            apartamentosDisponiblesArray.push(apartamento.apartamentoIDV)
        })
        const apartamentosNoDisponiblesArray = Array.from(new Set(apartametnosIDVBloqueoados));
        const apartamentosDisponiblesFinal = apartamentosDisponiblesArray.filter(apartamento => !apartamentosNoDisponiblesArray.includes(apartamento));
        const datosAirbnb = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
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
