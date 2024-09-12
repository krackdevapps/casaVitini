import Decimal from 'decimal.js';
import { obtenerDesgloseFinancieroPorReservaUID } from '../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../../../repositorio/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
import { obtenerDesgloseFinancieroPorSimulacionUID } from '../../../../repositorio/simulacionDePrecios/desgloseFinanciero/obtenerDesgloseFinancieroPorSimulacionUID.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const aplicarImpuestos = async (data) => {
    try {
        const estructura = data.estructura
        estructura.impuestos = []
        //estructura.instantaneaImpuestos = []
        const origen = data.origen
        //const instantaneaImpuestos = estructura.instantaneaImpuestos

        if (estructura.entidades.hasOwnProperty("reserva")) {
            const totalNeto = new Decimal(estructura.entidades.reserva.global.totales.totalNeto)
            const totalFinal = new Decimal(estructura.entidades.reserva.global.totales.totalFinal)
            const impuestos = []

            if (origen === "hubImuestos") {
                const impuestosDeAdministracion = await obtenerImpuestosPorAplicacionIDVPorEstado({
                    estadoIDV: "activado",
                    entidad: "reserva"
                })
                impuestos.push(...impuestosDeAdministracion)
                // instantaneaImpuestos.push(...impuestosDeAdministracion)
            } else if (origen === "instantaneaImpuestosEnReserva") {
                const reservaUID = data.reservaUID

                const contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
                const impuestosDeLaReserva = contenedorFinanciero.instantaneaImpuestos || []
                impuestos.push(...impuestosDeLaReserva)
                // instantaneaImpuestos.push(...impuestosDeLaReserva)
            } else if (origen === "instantaneaSimulacion") {
                const simulacionUID = data.simulacionUID


                const contenedorFinanciero = await obtenerDesgloseFinancieroPorSimulacionUID(simulacionUID)

                const impuestosDeLaSimulacion = contenedorFinanciero.instantaneaImpuestos || []
                impuestos.push(...impuestosDeLaSimulacion)
                // instantaneaImpuestos.push(...impuestosDeLaReserva)
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
            estructura.impuestos.push(...objetoImpuestos)
            estructura.entidades.reserva.global.totales.impuestosAplicados = sumaImpuestos.toFixed(2)
            estructura.entidades.reserva.global.totales.totalFinal = totalFinal.plus(sumaImpuestos).toFixed(2)
        }
        if (estructura.entidades.hasOwnProperty("servicios")) {
            const totalNeto = new Decimal(estructura.entidades.servicios.global.totales.totalNeto)
            const totalFinal = new Decimal(estructura.entidades.servicios.global.totales.totalFinal)
            const impuestos = []

            if (origen === "hubImuestos") {
                const impuestosDeAdministracion = await obtenerImpuestosPorAplicacionIDVPorEstado({
                    estadoIDV: "activado",
                    entidad: "servicio"
                })
                impuestos.push(...impuestosDeAdministracion)
                // instantaneaImpuestos.push(...impuestosDeAdministracion)
            } else if (origen === "instantaneaImpuestosEnReserva") {
                const reservaUID = data.reservaUID

                if (typeof reservaUID !== "number") {
                    const error = "reservaUID en aplicarImpuestos debe de ser un número."
                    throw new Error(error)
                }
                const contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
                const impuestosDeLaReserva = contenedorFinanciero.instantaneaImpuestos || []
                impuestos.push(...impuestosDeLaReserva)
                // instantaneaImpuestos.push(...impuestosDeLaReserva)
            } else if (origen === "instantaneaSimulacion") {
                const simulacionUID = data.simulacionUID


                const contenedorFinanciero = await obtenerDesgloseFinancieroPorSimulacionUID(simulacionUID)

                const impuestosDeLaSimulacion = contenedorFinanciero.instantaneaImpuestos || []
                impuestos.push(...impuestosDeLaSimulacion)
                // instantaneaImpuestos.push(...impuestosDeLaReserva)
            } else {
                const error = "aplicarImpuestos necesita un origen, este puede ser hubImuestos o reserva"
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
                if (entidadIDV !== "servicio") {
                    continue
                }
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

            estructura.impuestos.push(...objetoImpuestos)
            estructura.entidades.servicios.global.totales.impuestosAplicados = sumaImpuestos.toFixed(2)
            estructura.entidades.servicios.global.totales.totalFinal = totalFinal.plus(sumaImpuestos).toFixed(2)
        }
        const totalNeto = new Decimal(estructura.global.totales.totalNeto)
        const totalFinal = new Decimal(estructura.global.totales.totalFinal)
        const impuestos = []

        if (origen === "hubImuestos") {
            const impuestosDeAdministracion = await obtenerImpuestosPorAplicacionIDVPorEstado({
                estadoIDV: "activado",
                entidad: "global"
            })
            impuestos.push(...impuestosDeAdministracion)
            // instantaneaImpuestos.push(...impuestosDeAdministracion)
        } else if (origen === "instantaneaImpuestosEnReserva") {
            const reservaUID = data.reservaUID
            if (typeof reservaUID !== "number") {
                const error = "reservaUID en aplicarImpuestos debe de ser un número."
                throw new Error(error)
            }
            const contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
            const impuestosDeLaReserva = contenedorFinanciero.instantaneaImpuestos || []
            impuestos.push(...impuestosDeLaReserva)
            // instantaneaImpuestos.push(...impuestosDeLaReserva)
        } else if (origen === "instantaneaSimulacion") {
            const simulacionUID = data.simulacionUID


            const contenedorFinanciero = await obtenerDesgloseFinancieroPorSimulacionUID(simulacionUID)

            const impuestosDeLaSimulacion = contenedorFinanciero.instantaneaImpuestos || []
            impuestos.push(...impuestosDeLaSimulacion)
            // instantaneaImpuestos.push(...impuestosDeLaReserva)
        } else {
            const error = "aplicarImpuestos necesita un origen, este puede ser hubImuestos o reserva"
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
            if (entidadIDV !== "global") {
                continue
            }
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

        estructura.impuestos.push(...objetoImpuestos)
        estructura.global.totales.impuestosAplicados = sumaImpuestos.toFixed(2)
        //estructura.global.totales.totalFinal = totalFinal.plus(sumaImpuestos).toFixed(2)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
