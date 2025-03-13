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
            //totalDescuento: "0.00",
            //totalFinal: "0.00",
            //impuestosAplicados: "0.00"
        }
        if (!complementosEntidad.hasOwnProperty("desglosePorComplementoDeAlojamiento")) {
            complementosEntidad.desglosePorComplementoDeAlojamiento = []
        }
        const desglosePorComplementoDeAlojamiento = complementosEntidad.desglosePorComplementoDeAlojamiento

        if (!complementosEntidad.hasOwnProperty("desglosePorAlojamiento")) {
            complementosEntidad.desglosePorAlojamiento = {}
        }
        const desglosePorAlojamiento = complementosEntidad.desglosePorAlojamiento

        const nochesDeLaReserva = estructura.entidades.reserva.global.rango.nochesReserva


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
            let precioNetoComplementoPorNoche = "0.00"


            if (!desglosePorAlojamiento.hasOwnProperty(apartamentoIDV)) {
                desglosePorAlojamiento[apartamentoIDV] = {
                    global: {
                        totalNeto: "0.00",
                        totalNetoPorNoche: "0.00"
                    },
                    complementosDeAlojamiento: []
                }
            }
            desglosePorAlojamiento[apartamentoIDV].complementosDeAlojamiento.push(complemento)

            if (tipoPrecio === "fijoPorReserva") {
                const precioNetoComplemento = new Decimal(precioComplemento)
                complemento.total = precioNetoComplemento.toFixed(2)
                complemento.noches = nochesDeLaReserva
                complemento.totalNetoPorNoche = new Decimal(precioComplemento).div(nochesDeLaReserva).toFixed(2)
                complemento.totalNetoPorNocheSinRedondeo = new Decimal(precioComplemento).div(nochesDeLaReserva)
                global.totales.totalNeto = precioNetoComplemento.plus(global.totales.totalNeto)

            } else if (tipoPrecio === "porNoche") {
                const precioNetoComplemento = new Decimal(precioComplemento).mul(nochesDeLaReserva)
                complemento.noches = nochesDeLaReserva
                complemento.total = precioNetoComplemento.toFixed(2)
                complemento.totalNetoPorNoche = precioNetoComplemento.toFixed(2)
                global.totales.totalNeto = precioNetoComplemento.plus(global.totales.totalNeto)
                precioNetoComplementoPorNoche = precioComplemento
            }
        }

        Object.entries(desglosePorAlojamiento).forEach(cA => {
            const [apartamentoIDV, contenedor] = cA

            const global = contenedor.global
            const complementosDeAlojamiento = contenedor.complementosDeAlojamiento

            complementosDeAlojamiento.forEach(c => {
                const totalComplemento = c.total
                const totalPorNocheComplemento = c.totalNetoPorNoche

                const totalNeto = global.totalNeto
                const totalNetoPorNoche = global.totalNetoPorNoche

                global.totalNeto = new Decimal(totalNeto).plus(totalComplemento)
            })

            global.totalNetoPorNoche = new Decimal(global.totalNeto).div(nochesDeLaReserva)
            global.noches = nochesDeLaReserva
            global.totalNeto = global.totalNeto.toFixed(2)
            global.totalNetoPorNoche = global.totalNetoPorNoche.toFixed(2)

        })
        global.totales.totalNeto = global.totales.totalNeto.toFixed(2)

        const nochesReserva = contenedorEntidades.reserva.desglosePorNoche
        Object.values(nochesReserva).forEach(nR => {
            const { apartamentosPorNoche, precioNetoNoche } = nR

            nR.precioNetoNocheConComplementos = "0.00"

            Object.entries(apartamentosPorNoche).forEach(aPN => {
                const [apartamentoIDV, noche] = aPN
                if (desglosePorAlojamiento[apartamentoIDV]) {
                    const precioNetoApartamento = noche.precioNetoApartamento
                    const totalNetoNocheComplementos = desglosePorAlojamiento[apartamentoIDV].global.totalNeto
                    const precioNetoApartamentoComplementos = new Decimal(precioNetoApartamento).plus(totalNetoNocheComplementos)
                    noche.precioNetoApartamentoComplementos = precioNetoApartamentoComplementos
                    nR.precioNetoNocheConComplementos = new Decimal(nR.precioNetoNocheConComplementos).plus(precioNetoApartamentoComplementos)
                }
            })
        })


        const desglosePorApartamento = contenedorEntidades.reserva.desglosePorApartamento
        Object.entries(desglosePorApartamento).forEach(a => {

            const [apartamentoIDV, contenedor] = a

            if (desglosePorAlojamiento[apartamentoIDV]) {
                const totalNetoComplementos = desglosePorAlojamiento[apartamentoIDV].global.totalNeto
                const totalNeto = contenedor.totalNeto
                contenedor.totalNetoConComplementos = new Decimal(totalNetoComplementos).plus(totalNeto)
            }
        })

        const totalNetoAlojamiento = contenedorEntidades.reserva.global.totales.totalNeto
        contenedorEntidades.reserva.global.totales.totalNetoConComplementos = new Decimal(totalNetoAlojamiento).plus(global.totales.totalNeto)

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
