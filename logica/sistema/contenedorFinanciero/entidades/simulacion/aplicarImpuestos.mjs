import Decimal from 'decimal.js';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../../../repositorio/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
import { obtenerSimulacionPorSimulacionUID } from '../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const aplicarImpuestos = async (data) => {
    try {
        const estructura = data.estructura
        const origen = data.origen
        const totalNeto = new Decimal(estructura.global.totales.totalNeto)
        const totalFinal = new Decimal(estructura.global.totales.totalFinal)
        estructura.entidades.reserva.instantaneaImpuestos = []
        const instantaneaImpuestos = estructura.entidades.reserva.instantaneaImpuestos
        const impuestos = []

        if (origen === "administracion") {
            const impuestosDeAdministracion = await obtenerImpuestosPorAplicacionIDVPorEstado({
                estadoIDV: "activado",
                entidad: "reserva"
            })
            impuestos.push(...impuestosDeAdministracion)
            instantaneaImpuestos.push(...impuestosDeAdministracion)
        } else if (origen === "simulacion") {
            const simulacionUID = data.simulacionUID
            if (typeof simulacionUID !== "number") {
                const error = "simulacionUID en aplicarImpuestos debe de ser un número."
                throw new Error(error)
            }
            const contenedorFinanciero = await obtenerSimulacionPorSimulacionUID(simulacionUID)

            const impuestosDeLaReserva = contenedorFinanciero.instantaneaImpuestos || []
            impuestos.push(...impuestosDeLaReserva)
            instantaneaImpuestos.push(...impuestosDeLaReserva)
        } else {
            const error = "aplicarImpuestos necesita un origen, este puede ser administración o reserva"
            throw new Error(error)
        }
        const objetoImpuestos = []
        let sumaImpuestos = new Decimal("0")
        for (const impuesto of impuestos) {
            const nombre = impuesto.nombre
            const impuestoUID = impuesto.impuestoUID
            const tipoImpositivo = impuesto.tipoImpositivo
            const tipoValorIDV = impuesto.tipoValorIDV
            const entidadIDV = impuesto.entidadIDV
            const presentacionImpuesto = {
                nombre,
                impuestoUID,
                tipoValorIDV,
                entidadIDV
            }
            if (tipoValorIDV === "porcentaje") {
                const calculoImpuestoPorcentaje = totalNeto.times(tipoImpositivo).dividedBy(100)
                presentacionImpuesto.porcentaje = tipoImpositivo
                presentacionImpuesto.tipoImpositivo = calculoImpuestoPorcentaje
                sumaImpuestos = sumaImpuestos.plus(calculoImpuestoPorcentaje)
            }
            if (tipoValorIDV === "tasa") {
                const tipoImpositivoConst = new Decimal(tipoImpositivo)
                presentacionImpuesto.tipoImpositivo = tipoImpositivo,
                    sumaImpuestos = sumaImpuestos.plus(tipoImpositivoConst)
            }
            objetoImpuestos.push(presentacionImpuesto)
        }
        estructura.impuestos = objetoImpuestos
        estructura.global.totales.impuestosAplicados = sumaImpuestos.toFixed(2)
        estructura.global.totales.totalFinal = totalFinal.plus(sumaImpuestos).toFixed(2)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
