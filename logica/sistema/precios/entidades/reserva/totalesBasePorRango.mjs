import Decimal from 'decimal.js';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { constructorObjetoEstructuraPrecioDia } from './constructorObjetoEstructuraPrecioDia.mjs';
import { comportamientosPorRango } from '../../comportamientoPrecios/comportamientosPorRango.mjs'
import { constructorIndiceDias } from './constructorIndiceDias.mjs';
import { comportamientosPorDias } from '../../comportamientoPrecios/comportamientosPorDias.mjs';
import { aplicarCalculoDelComportamientoPorRango } from '../../comportamientoPrecios/aplicarCalculoDelComportamientoPorRango.mjs';
import { aplicarCalculoDelComportamientoPorDias } from '../../comportamientoPrecios/aplicarCalculoDelComportamientoPorDias.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
Decimal.set({ precision: 1000 });
export const totalesBasePorRango = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const fechaSalida_ISO = data.fechaSalida_ISO
        const apartamentosArray = data.apartamentosArray

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

        if (!reservaEntidad.hasOwnProperty("desglosePorNoche")) {
            reservaEntidad.desglosePorNoche = {}
        }
        reservaEntidad.desglosePorApartamento = {}

        const desglosePorNoche = reservaEntidad.desglosePorNoche
        const desglosePorApartamento = reservaEntidad.desglosePorApartamento

        const indiceDias = await constructorIndiceDias({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        })

        const comportamientosPorRangoFormateados = await comportamientosPorRango({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            arrayApartamentos: apartamentosArray
        })
        const comportamientosPorDiasFormateados = await comportamientosPorDias({
            nombreDiasAgrupados: indiceDias.nombresDiasAgrupados,
            arrayApartamentos: apartamentosArray
        })

        for (const [fecha_ISO, detallesDelDia] of Object.entries(desglosePorNoche)) {
            if (diasArray.includes(fecha_ISO)) {
                const apartamentosPorNoche = detallesDelDia.apartamentosPorNoche
                for (const [apartamentoIDV, detallesDelApartamento] of Object.entries(apartamentosPorNoche)) {
                    if (!apartamentosArray.includes(apartamentoIDV)) {
                        delete apartamentosPorNoche[apartamentoIDV]
                    }
                }
            } else {
                delete desglosePorNoche[fecha_ISO]
            }
        }
    
        for (const fecha_ISO of diasArray) {
            if (desglosePorNoche.hasOwnProperty[fecha_ISO]) {
                continue
            }
            const totalesPorNoche = {
                //fechaDiaConNoche: fecha_ISO,
                precioNetoNoche: new Decimal("0"),
                apartamentosPorNoche: {}
            }
            for (const apartamentoIDV of apartamentosArray) {

                const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
                const precioBase = perfilPrecio.precio

                const apartamentosPorNoche = totalesPorNoche.apartamentosPorNoche
                if (!apartamentosPorNoche.hasOwnProperty(apartamentoIDV)) {
                    apartamentosPorNoche[apartamentoIDV] = {
                        apartamentoUI: (await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)).apartamentoUI,
                        precioNetoApartamento: precioBase
                    }
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
                const precioNetoApartamento = new Decimal(apartamentoEstructura.precioNetoApartamento)

                totalesPorNoche.precioNetoNoche = totalesPorNoche.precioNetoNoche.plus(precioNetoApartamento)
                if (!desglosePorApartamento.hasOwnProperty(apartamentoIDV)) {
                    desglosePorApartamento[apartamentoIDV] = {
                        apartamentoUI: (await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)).apartamentoUI,
                        totalNeto: new Decimal(0)
                    }
                }
                const totalPorApartamento = desglosePorApartamento[apartamentoIDV].totalNeto
                desglosePorApartamento[apartamentoIDV].totalNeto = new Decimal(totalPorApartamento).plus(precioNetoApartamento).toFixed(2)
            }
            totalesPorNoche.precioNetoNoche = totalesPorNoche.precioNetoNoche.toFixed(2)
            desglosePorNoche[fecha_ISO] = totalesPorNoche
        }


        const totales = estructura.global.totales
        totales.totalNeto = new Decimal("0.00")
        totales.totalFinal = "0.00"

        Object.entries(desglosePorApartamento).forEach(([apartamentoIDV, totalPorApartamento]) => {
            const totalNetoPorApartmento = totalPorApartamento.totalNeto
            totalPorApartamento.precioMedioNetoNoche = new Decimal(totalNetoPorApartmento).div(diasArray.length).toDecimalPlaces(2).toFixed(2);
            const totalNeto = totales.totalNeto
            estructura.global.totales.totalNeto = totalNeto.plus(totalNetoPorApartmento)
        })
        const totalNeto = totales.totalNeto
        totales.totalNeto = totalNeto.toFixed(2)
        totales.promedioNocheNeto = totalNeto.div(diasArray.length).toDecimalPlaces(2).toFixed(2)
        totales.totalFinal = totalNeto.toFixed(2)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
