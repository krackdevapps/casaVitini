import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { selecionarOfertasPorCondicion } from "../../../../sistema/ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs"
import { obtenerOfertasPorRangoActualPorCodigoDescuentoArray } from "../../../../repositorio/simulacionDePrecios/ofertas/obtenerOfertasPorRangoActualPorCodigoDescuentoArray.mjs"
import { selectorPorCondicion } from "../../../../sistema/ofertas/entidades/reserva/selectorPorCondicion.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../sistema/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"

export const comprobarCodigosEnSimulacion = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const codigosDescuentoArray = []
        const codigoDescuentoArrayAsci = validadoresCompartidos.tipos.array({
            array: entrada.body.codigosDescuentos,
            nombreCampo: "El campo codigoDescuento",
            sePermitenDuplicados: "no"
        })

        codigoDescuentoArrayAsci.forEach((codigo) => {
            const codigoDescuentoB64 = validadoresCompartidos.tipos.cadena({
                string: codigo,
                nombreCampo: "No has escrito ningún código de descuento, recuerda que",
                filtro: "transformaABase64",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            codigosDescuentoArray.push(codigoDescuentoB64)
        })


        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await validarDataGlobalDeSimulacion(simulacionUID)


        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const fechaCreacion = simulacion.fechaCreacion
        const apartamentosArray = simulacion.apartamentosIDVARRAY
        const zonaIDV = simulacion.zonaIDV

        try {
            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }
        } catch (error) {
            const m = "No se puede reconstruir esta simulacion de desglose financiero desde los hubs de precios, porque hay apartamentos que ya no existen como configuración de alojamiento en el hub de configuraciones de alojamiento."
            throw new Error(m)
        }

        const ofertasPreSeleccionadas = await obtenerOfertasPorRangoActualPorCodigoDescuentoArray({
            zonasArray: [zonaIDV],
            entidadIDV: "reserva",
            codigosDescuentoArray: codigosDescuentoArray
        })
        if (!ofertasPreSeleccionadas.length === 0) {
            const m = "No hay ninguna oferta con ese codigo de descuneto, revisa el codigo de descuneto"
            throw new Error(m)
        }

        const ofertaAnalizadasPorCondiciones = []
        const ofertasProcesadas = {
            compatible: [],
            incompatible: []
        }
        for (const oferta of ofertasPreSeleccionadas) {

            const condicionesArray = oferta.condicionesArray
            let interruptor = false
            condicionesArray.forEach((contenedor) => {
                const tipoCondicion = contenedor.tipoCondicion
                if (tipoCondicion === "porCodigoDescuento") {
                    interruptor = true
                }
            })
            if (interruptor === false) {
                continue
            }
            const resultadoSelector = await selectorPorCondicion({
                oferta: oferta,
                apartamentosArray: apartamentosArray,
                fechaActual_reserva: fechaCreacion,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
                codigoDescuentosArrayBASE64: codigosDescuentoArray,
                ignorarCodigosDescuentos: "no"
            })
            resultadoSelector.autorizacion = "aceptada"
            const condicionesQueNoSeCumple = resultadoSelector.condicionesQueNoSeCumple
            if (condicionesQueNoSeCumple.length === 0) {
                ofertasProcesadas.compatible.push(resultadoSelector)
            } else {
                ofertasProcesadas.incompatible.push(resultadoSelector)
            }
        }

        const ofertasCompatibles = ofertasProcesadas.compatible
        for (const contenedorOferta of ofertasCompatibles) {
            const ofertaUID = contenedorOferta.oferta.ofertaUID
            const ofertaExistente = await obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion({
                simulacionUID,
                ofertaUID,
                errorSi: "desactivado"
            })

            if (ofertaExistente?.simulacionUID) {
                contenedorOferta.enSimulacion = "si"
            }
        }

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Aqui tienes la lista de oferta procesadas por los codigos enviados",
            ofertas: ofertasProcesadas
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}