import Decimal from 'decimal.js';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { constructorObjetoEstructuraPrecioDia } from './constructorObjetoEstructuraPrecioDia.mjs';
import { comportamientosPorRango } from './comportamientoPrecios/comportamientosPorRango.mjs'
import { constructorIndiceDias } from './constructorIndiceDias.mjs';
import { comportamientosPorDias } from './comportamientoPrecios/comportamientosPorDias.mjs';
import { aplicarCalculoDelComportamientoPorRango } from './comportamientoPrecios/aplicarCalculoDelComportamientoPorRango.mjs';
import { aplicarCalculoDelComportamientoPorDias } from './comportamientoPrecios/aplicarCalculoDelComportamientoPorDias.mjs';
import { constructorTotalesPorApartamento } from './contructorTotalesPorApartamento.mjs';
Decimal.set({ precision: 1000 });
export const totalesBasePorRango = async (metadatos) => {
    try {
        const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
        const fechaSalida_ISO = metadatos.fechaSalida_ISO
        const apartamentosArray = metadatos.apartamentosArray
        const diasArray = constructorObjetoEstructuraPrecioDia(fechaEntrada_ISO, fechaSalida_ISO)
        diasArray.pop()

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

        const desglosePorNoches = []
        const totalesPorApartamento = {}

        for (const fecha_ISO of diasArray) {
            const totalesPorNoche = {
                fechaDiaConNoche: fecha_ISO,
                precioNetoNoche: new Decimal("0"),
                apartamentosPorNoche: []
            }
            for (const apartamentoIDV of apartamentosArray) {

                const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
                const precioBase = perfilPrecio.precio

                const apartamentosPorNoch_estructura = {
                    apartamentoIDV: apartamentoIDV,
                    precioNetoApartamento: precioBase,
                }
                apartamentosPorNoch_estructura.precioNetoApartamento = await aplicarCalculoDelComportamientoPorRango({
                    comportamientosPorRangoFormateados,
                    apartamentoIDV,
                    fechaDiaConNoche: fecha_ISO,
                    precioNetoApartamento: apartamentosPorNoch_estructura.precioNetoApartamento,
                })

                apartamentosPorNoch_estructura.precioNetoApartamento = await aplicarCalculoDelComportamientoPorDias({
                    comportamientosPorDiasFormateados,
                    apartamentoIDV,
                    fechaDiaConNoche: fecha_ISO,
                    precioNetoApartamento: apartamentosPorNoch_estructura.precioNetoApartamento,
                    indiceDias,
                })

                const precioNetoApartamento = new Decimal(apartamentosPorNoch_estructura.precioNetoApartamento)

                totalesPorNoche.precioNetoNoche = totalesPorNoche.precioNetoNoche.plus(precioNetoApartamento)
                totalesPorNoche.apartamentosPorNoche.push(apartamentosPorNoch_estructura)

                if (!totalesPorApartamento.hasOwnProperty(apartamentoIDV)) {
                    totalesPorApartamento[apartamentoIDV] = new Decimal(0)
                }
                const totalPorApartamento = totalesPorApartamento[apartamentoIDV]
                totalesPorApartamento[apartamentoIDV] = totalPorApartamento.plus(precioNetoApartamento)
            }

            desglosePorNoches.push(totalesPorNoche)
        }
        const estructuraTotales = {
            nochesReserva: diasArray.length,
            desglosePorNoche: desglosePorNoches,
            desglosePorApartamento: await constructorTotalesPorApartamento({
                totalesPorApartamento,
                diasArray
            })
        }
        return estructuraTotales
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
