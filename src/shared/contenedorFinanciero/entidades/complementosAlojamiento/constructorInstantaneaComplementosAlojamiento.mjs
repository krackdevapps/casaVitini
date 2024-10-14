import Decimal from 'decimal.js';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const constructorInstantaneaComplementosAlojamiento = async (data) => {
    try {
        const estructura = data.estructura
        const complementos = data.complementos

        const contenedorEntidades = estructura.entidades

        if (!contenedorEntidades.hasOwnProperty("complementosAlojamiento")) {
            contenedorEntidades.complementosAlojamiento = {}
        }
        const complementosEntidad = contenedorEntidades.complementosAlojamiento
        if (!complementosEntidad.hasOwnProperty("global")) {
            complementosEntidad.global = {}
        }
        const global = complementosEntidad.global
        global.totales = {
            totalNeto: new Decimal("0.00"),
            totalDescuento: "0.00",
            totalFinal: "0.00",
            impuestosAplicados: "0.00"
        }
        if (!complementosEntidad.hasOwnProperty("desglosePorServicios")) {
            complementosEntidad.desglosePorComplementoDeAlojamiento = []
        }
        const desglosePorComplementoDeAlojamiento = complementosEntidad.desglosePorComplementoDeAlojamiento

        for (const complemento of complementos) {
            delete complemento.testingVI
            desglosePorComplementoDeAlojamiento.push(complemento)
            const precioComplemento = complemento.precio
            const apartamentoIDV = complemento.apartamentoIDV
            const nombre = complemento.nombre
           const complementoUID = complemento.complementoUID
            const tipoPrecio = complemento.tipoPrecio
            const estadoIDV = complemento.estadoIDV
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
            complemento.apartamentoUI = apartamento.apartamentoUI
            if (estadoIDV === "desactivado") {
                const m = `Èl complemento de alojamiento ${nombre} con UID ${complementoUID} ya no esta disponible.`
                throw new Error(m);
            }

            if (tipoPrecio === "fijoPorReserva") {
                const precioNetoComplemento = new Decimal(precioComplemento)
                global.totales.totalNeto = precioNetoComplemento.plus(global.totales.totalNeto)

            } else if (tipoPrecio === "porNoche") {
                const nochesDeLaReserva = estructura.entidades.reserva.global.rango.nochesReserva    
                const precioNetoComplemento = new Decimal(precioComplemento).mul(nochesDeLaReserva)
                complemento.noches = nochesDeLaReserva
                complemento.total = precioNetoComplemento
                global.totales.totalNeto = precioNetoComplemento.plus(global.totales.totalNeto)
            }
        }
        global.totales.totalNeto = global.totales.totalNeto.toFixed(2)
        global.totales.totalFinal = global.totales.totalNeto

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
