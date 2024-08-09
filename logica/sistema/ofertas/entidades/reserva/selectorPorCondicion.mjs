import { DateTime } from "luxon";
import { selectorRangoUniversal } from "../../../selectoresCompartidos/selectorRangoUniversal.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";

export const selectorPorCondicion = async (data) => {
    try {
        const oferta = data.oferta
        const condiciones = oferta.condicionesArray
        const apartamentosArray = data.apartamentosArray
        const fechaActual_reserva = data.fechaActual_reserva
        const fechaEntrada_reserva = data.fechaEntrada_reserva
        const fechaSalida_reserva = data.fechaSalida_reserva
        const codigoDescuentosArrayBASE64 = data.codigoDescuentosArrayBASE64
        const resultadoSelector = {
            oferta,
            condicionesQueSeCumplen: [],
            condicionesQueNoSeCumple: []
        }
        for (const condicion of condiciones) {
            const tipoCondicion = condicion.tipoCondicion
            const nombreOferta = oferta.nombreOferta
            if (tipoCondicion === "conFechaEntradaEntreRango") {
                const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO

                const fechaInicioRango_objeto = DateTime.fromISO(fechaInicioRango_ISO)
                const fechaFinalRango_objeto = DateTime.fromISO(fechaFinalRango_ISO)
                const fechaEntrada_reserva_objeto = DateTime.fromISO(fechaEntrada_reserva)

                const fechaDentroDelRango = fechaEntrada_reserva_objeto >= fechaInicioRango_objeto && fechaEntrada_reserva_objeto <= fechaFinalRango_objeto;
                if (!fechaDentroDelRango) {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                }
            } else if (tipoCondicion === "conFechaCreacionEntreRango") {
                const fechaInicioOferta = oferta.fechaInicio
                const fechaFinalOferata = oferta.fechaFinal

                const fechaInicioOferta_objeto = DateTime.fromISO(fechaInicioOferta)
                const fechaFinalOferta_objeto = DateTime.fromISO(fechaFinalOferata)
                const fechaActual_objeto = DateTime.fromISO(fechaActual_reserva)

                const fechaDentroDelRango = fechaActual_objeto >= fechaInicioOferta_objeto && fechaActual_objeto <= fechaFinalOferta_objeto;
                if (!fechaDentroDelRango) {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                }

            } else if (tipoCondicion === "porNumeroDeApartamentos") {

                const numeroApartamentosReserva = apartamentosArray.length
                const numeroApartamentosOferta = condicion.numeroDeApartamentos
                const tipoConteo = condicion.tipoConteo

                if (tipoConteo === "numeroExacto") {
                    if (Number(numeroApartamentosOferta) === Number(numeroApartamentosReserva)) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoConteo === "aPartirDe") {
                    if (Number(numeroApartamentosOferta) <= Number(numeroApartamentosReserva)) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoConteo === "hastaUnNumeroExacto") {
                    if (Number(numeroApartamentosOferta) >= Number(numeroApartamentosReserva)) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                }
            } else if (tipoCondicion === "porDiasDeAntelacion") {
                const fechaActual_objeto = DateTime.fromISO(fechaActual_reserva)
                const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_reserva)
                const tipoConteo = condicion.tipoConteo
                const numeroDeDias = Number(condicion.numeroDeDias)

                const diasAntelacion = Math.floor(fechaEntrada_objeto.diff(fechaActual_objeto, 'days').days);
                if (tipoConteo === "aPartirDe") {
                    if (numeroDeDias <= diasAntelacion) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoConteo === "numeroExacto") {
                    if (numeroDeDias === diasAntelacion) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoConteo === "hastaUnNumeroExacto") {
                    if (numeroDeDias >= diasAntelacion) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                }

            } else if (tipoCondicion === "porRangoDeFechas") {
                const fechaInicio_oferta = condicion.fechaInicioRango_ISO
                const fechaFinal_oferta = condicion.fechaFinalRango_ISO

                const rangoFechasReservaEnRangoFechaOferta = await selectorRangoUniversal({
                    fechaInicio_rango_ISO: fechaInicio_oferta,
                    fechaFin_rango_ISO: fechaFinal_oferta,
                    fechaInicio_elemento_ISO: fechaEntrada_reserva,
                    fechaFin_elemento_ISO: fechaSalida_reserva,
                    tipoLimite: "incluido"
                })

                if (rangoFechasReservaEnRangoFechaOferta) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
            } else if (tipoCondicion === "porDiasDeReserva") {

                const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_reserva)
                const fechaSalida_objeto = DateTime.fromISO(fechaSalida_reserva)
                const tipoConteo = condicion.tipoConteo
                const numeroDias = Number(condicion.numeroDeDias)
                const nochesDeLaReserva = Math.floor(fechaSalida_objeto.diff(fechaEntrada_objeto, 'days').days);

                if (tipoConteo === "aPartirDe") {
                    if (numeroDias <= nochesDeLaReserva) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }

                } else if (tipoConteo === "numeroExacto") {
                    if (numeroDias === nochesDeLaReserva) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoConteo === "hastaUnNumeroExacto") {
                    if (numeroDias >= nochesDeLaReserva) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                }

            } else if (tipoCondicion === "porApartamentosEspecificos") {
                const apartamentosDeLaReserva = apartamentosArray
                const contenedorApartamentos = condicion.apartamentos
                const tipoDeEspecificidad = condicion.tipoDeEspecificidad
                const apartamentosOferta = []
                contenedorApartamentos.forEach(contenedor => {
                    const apartamentoIDV = contenedor.apartamentoIDV
                    apartamentosOferta.push(apartamentoIDV)
                })
                if (tipoDeEspecificidad === "exactamente") {

                    const comparadorCantidad = apartamentosDeLaReserva.length === apartamentosOferta.length
                    const selector = apartamentosDeLaReserva.every(apartamentoIDV => apartamentosOferta.includes(apartamentoIDV))

                    if (selector && comparadorCantidad) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoDeEspecificidad === "alguno") {
                    const selector = apartamentosOferta.some(apartamentoIDV => apartamentosDeLaReserva.includes(apartamentoIDV))
                    if (selector) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoDeEspecificidad === "exactamenteEntreOtros") {
                    const comparadorCantidad = apartamentosDeLaReserva.length >= apartamentosOferta.length
                    const selector = apartamentosOferta.every(apartamentoIDV => apartamentosDeLaReserva.includes(apartamentoIDV))
                    if (selector && comparadorCantidad) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoDeEspecificidad === "noDebeContenedorExactamente") {

                    // const comparadorCantidad = apartamentosDeLaReserva.length === apartamentosOferta.length
                    const selector = apartamentosDeLaReserva.every(apartamentoIDV => !apartamentosOferta.includes(apartamentoIDV))

                    if (selector /*&& comparadorCantidad*/) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } if (tipoDeEspecificidad === "noDebeContenedorAlguno") {
                    const selector = apartamentosOferta.some(apartamentoIDV => !apartamentosDeLaReserva.includes(apartamentoIDV))
                    if (selector) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                }
                // else if (tipoDeEspecificidad === "noDebeContenedorExactamenteEntreOtros") {
                //     const comparadorCantidad = apartamentosDeLaReserva.length >= apartamentosOferta.length
                //     const selector = apartamentosOferta.every(apartamentoIDV => !apartamentosDeLaReserva.includes(apartamentoIDV))
                //     if (selector && comparadorCantidad) {
                //         resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                //     } else {
                //         resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                //     }
                // }











            } else if (tipoCondicion === "porCodigoDescuento") {
                const codigoDescuentoBase64 = condicion.codigoDescuento
                if (codigoDescuentosArrayBASE64.includes(codigoDescuentoBase64)) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
            } else {
                const error = `En la oferta ${nombreOferta} no se reconoce el identificador de condición ${tipoCondicion}`
                throw new Error(error)
            }
        }
        return resultadoSelector
    } catch (error) {
        throw error
    }
}
