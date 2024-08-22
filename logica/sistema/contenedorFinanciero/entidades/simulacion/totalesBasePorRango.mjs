import Decimal from 'decimal.js';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { constructorObjetoEstructuraPrecioDia } from '../reserva/constructorObjetoEstructuraPrecioDia.mjs';
import { constructorIndiceDias } from '../reserva/constructorIndiceDias.mjs';
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
        const simulacionUID = data.simulacionUID


        const diasArray = constructorObjetoEstructuraPrecioDia(fechaEntrada, fechaSalida)
        diasArray.pop()
        const contenedorEntidadtes = estructura.entidades

        if (!contenedorEntidadtes.hasOwnProperty("reserva")) {
            estructura.entidades.reserva = {}
        }
        const simulacionEntidad = contenedorEntidadtes.reserva
        simulacionEntidad.fechaEntrada = fechaEntrada
        simulacionEntidad.fechaSalida = fechaSalida
        simulacionEntidad.nochesReserva = diasArray.length.toString()
        const instantaneaNoches = simulacionEntidad.instantaneaNoches


        if (!simulacionEntidad.hasOwnProperty("desglosePorNoche")) {
            simulacionEntidad.desglosePorNoche = {}
        }
        simulacionEntidad.desglosePorApartamento = {}

        if (instantaneaNoches) {
            simulacionEntidad.desglosePorNoche = _.cloneDeep(instantaneaNoches);

        }

        const desglosePorNoche = simulacionEntidad.desglosePorNoche
        const desglosePorApartamento = simulacionEntidad.desglosePorApartamento

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
                        simulacionUID,
                        netoApartamento: netoApartamento,
                        fechaNoche: fecha_ISO,
                        apartamentoIDV: apartamentoIDV
                    })
                    if (sobreControl.encontrado === "si") {
                        const detallesSobreControl = sobreControl.detallesSobreControl
                        const valorSobreControl = sobreControl.valorFinal

                        apartamentosPorNoche[apartamentoIDV].precioNetoApartamento = valorSobreControl.toFixed(2)
                        if (!simulacionEntidad.hasOwnProperty("contenedorSobreControles")) {
                            simulacionEntidad.contenedorSobreControles = {}
                        }
                        const contenedorSobreControles = simulacionEntidad.contenedorSobreControles
                        if (!contenedorSobreControles.hasOwnProperty(fecha_ISO)) {
                            contenedorSobreControles[fecha_ISO] = {}
                        }
                        contenedorSobreControles[fecha_ISO][apartamentoIDV] = detallesSobreControl
                    }
                }
                // Error aqui

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
