import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerOfertasPorRangoActualPorCodigoDescuentoArray } from "../../../../infraestructure/repository/simulacionDePrecios/ofertas/obtenerOfertasPorRangoActualPorCodigoDescuentoArray.mjs"
import { selectorPorCondicion } from "../../../../shared/ofertas/entidades/reserva/selectorPorCondicion.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { soloFiltroDataGlobal } from "../../../../shared/simuladorDePrecios/soloFiltroDataGlobal.mjs"
import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs"
import { utilidades } from "../../../../shared/utilidades.mjs"

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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const codigosDescuentoArray = []
        const codigoDescuentoArrayAsci = validadoresCompartidos.tipos.array({
            array: entrada.body.codigosDescuentos,
            nombreCampo: "El campo codigoDescuento",
            filtro: "filtroDesactivado",
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
        const llavesGlobalesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        if (llavesGlobalesFaltantes.length > 0) {
            const llavesSring = utilidades.constructorComasEY({
                array: llavesGlobalesFaltantes,
                articulo: ""
            })
            const m = `No se puede comprobar el codigo de descuento en la simulacion, por que faltan los siguientes datos globales de la simulacion: ${llavesSring}`
            throw new Error(m)
        }
        const alojamiento = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)
        const apartamentosArray = alojamiento.map(a => a.apartamentoIDV)

        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const fechaCreacion = simulacion.fechaCreacion
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
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Aqui tienes la lista de oferta procesadas por los codigos enviados",
            ofertas: ofertasProcesadas,
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}