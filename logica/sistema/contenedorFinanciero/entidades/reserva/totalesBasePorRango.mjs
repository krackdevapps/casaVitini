import Decimal from 'decimal.js';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { constructorObjetoEstructuraPrecioDia } from './constructorObjetoEstructuraPrecioDia.mjs';
import { constructorIndiceDias } from './constructorIndiceDias.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { aplicarSobreControl } from './aplicarSobreControl.mjs';
import _ from 'lodash';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)

Decimal.set({ precision: precisionDecimal });
export const totalesBasePorRango = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray
        const reservaUID = data.reservaUID

        const diasArray = constructorObjetoEstructuraPrecioDia(fechaEntrada, fechaSalida)
        diasArray.pop()
        const contenedorEntidadtes = estructura.entidades

        if (!contenedorEntidadtes.hasOwnProperty("reserva")) {
            estructura.entidades.reserva = {}
        }
        const reservaEntidad = contenedorEntidadtes.reserva
        reservaEntidad.fechaEntrada = fechaEntrada
        reservaEntidad.fechaSalida = fechaSalida
        reservaEntidad.nochesReserva = diasArray.length.toString()
        const instantaneaNoches = reservaEntidad.instantaneaNoches


        if (!reservaEntidad.hasOwnProperty("desglosePorNoche")) {
            reservaEntidad.desglosePorNoche = {}
        }
        reservaEntidad.desglosePorApartamento = {}

        if (instantaneaNoches) {
            reservaEntidad.desglosePorNoche = _.cloneDeep(instantaneaNoches);

        }

        const desglosePorNoche = reservaEntidad.desglosePorNoche
        const desglosePorApartamento = reservaEntidad.desglosePorApartamento

        const indiceDias = await constructorIndiceDias({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida
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
            if (!desglosePorNoche.hasOwnProperty(fecha_ISO)) {
                desglosePorNoche[fecha_ISO] = {
                    precioNetoNoche: "0.00",
                    apartamentosPorNoche: {}
                }
            }
            const noche = desglosePorNoche[fecha_ISO]
            noche.precioNetoNoche = "0.00"
            for (const apartamentoIDV of apartamentosArray) {
    
               // const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
               // const precioBase = perfilPrecio.precio

                const apartamentosPorNoche = noche.apartamentosPorNoche
                if (apartamentosPorNoche.hasOwnProperty(apartamentoIDV)) {

                    const netoApartamento = apartamentosPorNoche[apartamentoIDV].precioNetoApartamento
                    const sobreControl = await aplicarSobreControl({
                        reservaUID,
                        netoApartamento: netoApartamento,
                        fechaNoche: fecha_ISO,
                        apartamentoIDV: apartamentoIDV
                    })
                    if (sobreControl.encontrado === "si") {
                        const detallesSobreControl = sobreControl.detallesSobreControl
                        const valorSobreControl = sobreControl.valorFinal

                        apartamentosPorNoche[apartamentoIDV].precioNetoApartamento = valorSobreControl.toFixed(2)
                        if (!reservaEntidad.hasOwnProperty("contenedorSobreControles")) {
                            reservaEntidad.contenedorSobreControles = {}
                        }
                        const contenedorSobreControles = reservaEntidad.contenedorSobreControles
                        if (!contenedorSobreControles.hasOwnProperty(fecha_ISO)) {
                            contenedorSobreControles[fecha_ISO] = {}
                        }
                        contenedorSobreControles[fecha_ISO][apartamentoIDV] = detallesSobreControl
                    }
                }
                const precioNetoApartamento = new Decimal(apartamentosPorNoche[apartamentoIDV].precioNetoApartamento)
                const totalNetoNoche = noche.precioNetoNoche || "0.00"
                noche.precioNetoNoche = new Decimal(totalNetoNoche).plus(precioNetoApartamento).toFixed(2)

                if (!desglosePorApartamento.hasOwnProperty(apartamentoIDV)) {
                    desglosePorApartamento[apartamentoIDV] = {
                        apartamentoUI: (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV,
                            errorSi: "desactivado"
                        })).apartamentoUI,
                        totalNeto: new Decimal(0)
                    }
                }
                const totalPorApartamento = desglosePorApartamento[apartamentoIDV].totalNeto
                desglosePorApartamento[apartamentoIDV].totalNeto = new Decimal(totalPorApartamento).plus(precioNetoApartamento).toFixed(2)
            }
        }
        const totales = estructura.global.totales
        totales.totalNeto = new Decimal("0.00")
        totales.totalFinal = "0.00"

        Object.entries(desglosePorApartamento).forEach(([apartamentoIDV, detallesApartamento]) => {
            const totalNetoPorApartmento = detallesApartamento.totalNeto
            detallesApartamento.precioMedioNetoNoche = new Decimal(totalNetoPorApartmento).div(diasArray.length).toDecimalPlaces(2).toFixed(2);
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
