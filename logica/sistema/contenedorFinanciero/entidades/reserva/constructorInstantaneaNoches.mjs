import Decimal from 'decimal.js';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { constructorObjetoEstructuraPrecioDia } from './constructorObjetoEstructuraPrecioDia.mjs';
import { comportamientosPorRango } from '../../comportamientoPrecios/comportamientosPorRango.mjs'
import { constructorIndiceDias } from './constructorIndiceDias.mjs';
import { comportamientosPorDias } from '../../comportamientoPrecios/comportamientosPorDias.mjs';
import { aplicarCalculoDelComportamientoPorRango } from '../../comportamientoPrecios/aplicarCalculoDelComportamientoPorRango.mjs';
import { aplicarCalculoDelComportamientoPorDias } from '../../comportamientoPrecios/aplicarCalculoDelComportamientoPorDias.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const constructorInstantaneaNoches = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const fechaSalida_ISO = data.fechaSalida_ISO
        const fechaCreacion_ISO = data.fechaCreacion_ISO
        const apartamentosArray = data.apartamentosArray
        const instantaneaNoches = data.instantaneaNoches

        const diasArray = constructorObjetoEstructuraPrecioDia(fechaEntrada_ISO, fechaSalida_ISO)
        diasArray.pop()
        const contenedorEntidadtes = estructura.entidades

        if (!contenedorEntidadtes.hasOwnProperty("reserva")) {
            estructura.entidades.reserva = {}
        }
        const reservaEntidad = contenedorEntidadtes.reserva
        reservaEntidad.fechaEntrada = fechaEntrada_ISO
        reservaEntidad.fechaSalida = fechaEntrada_ISO
        reservaEntidad.nochesReserva = diasArray.length.toString()

        if (!reservaEntidad.hasOwnProperty("instantaneaNoches")) {
            reservaEntidad.instantaneaNoches = {}
        }

        if (instantaneaNoches) {
            reservaEntidad.instantaneaNoches = instantaneaNoches
        }
        const contenedorInstantaneaNoche = reservaEntidad.instantaneaNoches

        const indiceDias = await constructorIndiceDias({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        })

        const comportamientosPorRangoFormateados = await comportamientosPorRango({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            fechaCreacionReserva: fechaCreacion_ISO,
            arrayApartamentos: apartamentosArray
        })
        const comportamientosPorDiasFormateados = await comportamientosPorDias({
            nombreDiasAgrupados: indiceDias.nombresDiasAgrupados,
            arrayApartamentos: apartamentosArray
        })

        for (const [fecha_ISO, detallesDelDia] of Object.entries(contenedorInstantaneaNoche)) {
            if (diasArray.includes(fecha_ISO)) {
                const apartamentosPorNoche = detallesDelDia.apartamentosPorNoche
                for (const [apartamentoIDV, detallesDelApartamento] of Object.entries(apartamentosPorNoche)) {
                    if (!apartamentosArray.includes(apartamentoIDV)) {
                        delete apartamentosPorNoche[apartamentoIDV]
                    }
                }
            } else {
                delete contenedorInstantaneaNoche[fecha_ISO]
            }
        }
        for (const fecha_ISO of diasArray) {
            if (!contenedorInstantaneaNoche.hasOwnProperty(fecha_ISO)) {
                contenedorInstantaneaNoche[fecha_ISO] = {
                    apartamentosPorNoche: {}
                }
            }
            const noche = contenedorInstantaneaNoche[fecha_ISO]
            for (const apartamentoIDV of apartamentosArray) {

                const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
                const precioBase = perfilPrecio.precio

                const apartamentosPorNoche = noche.apartamentosPorNoche
                if (!apartamentosPorNoche.hasOwnProperty(apartamentoIDV)) {
                    
                    apartamentosPorNoche[apartamentoIDV] = {
                        apartamentoUI: (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV,
                            errorSi: "desactivado"
                        })).apartamentoUI,
                        precioNetoApartamento: precioBase
                    }
                    const apartamentoEstructura = apartamentosPorNoche[apartamentoIDV]

                    apartamentoEstructura.precioNetoApartamento = await aplicarCalculoDelComportamientoPorRango({
                        comportamientosPorRangoFormateados,
                        apartamentoIDV,
                        fechaDiaConNoche: fecha_ISO,
                        precioNetoApartamento: apartamentoEstructura.precioNetoApartamento
                    })

                    apartamentoEstructura.precioNetoApartamento = await aplicarCalculoDelComportamientoPorDias({
                        comportamientosPorDiasFormateados,
                        apartamentoIDV,
                        fechaDiaConNoche: fecha_ISO,
                        precioNetoApartamento: apartamentoEstructura.precioNetoApartamento,
                        indiceDias
                    })
                }
            }
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
