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

export const insertarDescuentoPorCompatiblePorCodigo = async (entrada) => {
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

        // const codigoDescuentoBASE64 = validadoresCompartidos.tipos.cadena({
        //     string: entrada.body.codigoDescuento,
        //     nombreCampo: "El identificador universal de la oferta (codigoDescuento)",
        //     filtro: "cadenaBase64",
        //     sePermiteVacio: "no",
        //     limpiezaEspaciosAlrededor: "si"
        // })
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
            })
            codigosDescuentoArray.push(codigoDescuentoB64)
        })

        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)

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


        // PreValidacion, para obtener las condicoones que no se cumplen
        // Primero selecionar la oferta que tenga ese codigo
        const oferta = await obtenerOfertasPorRangoActualPorCodigoDescuentoArray({
            zonasArray: [zonaIDV],
            entidadIDV: "reserva",
            codigosDescuentoArray: codigosDescuentoArray
        })
        if (!oferta.ofertaUID) {
            const m = "No hay ninguna oferta con ese codigo de descuneto, revisa el codigo de descuneto"
            throw new Error(m)   
        }

        // Si no hay ninguna oferta que tenga ese codigo informar

        // Como solo puede haber un codigo unico, si existe la oferta pasarla por el selector de condicion



        const ofertasSeleciondas = await selecionarOfertasPorCondicion({
            estructura,
            fechaActual,
            fechaEntrada,
            fechaSalida,
            apartamentosArray,
            zonasArray,
            descuentosParaRechazar,
            codigoDescuentosArrayBASE64: codigosDescuentoArray
        })
        if (ofertasSeleciondas.length === 0) {
            
        }














        // await obtenerOferatPorOfertaUID(ofertaUID)
        // await obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion({
        //     simulacionUID,
        //     ofertaUID,
        //     errorSi: "existe"
        // })
        // // validar aqui que la oferta por condicion no esta ya en la instantanea


        // // Desde aqui se envia esto mas el ofertaUID
        // const desgloseFinanciero = await procesador({
        //     entidades: {
        //         simulacion: {
        //             tipoOperacion: "insertarDescuentoCompatibleConSimulacion",
        //             simulacionUID,
        //             ofertaUID,
        //             fechaEntrada: fechaEntrada,
        //             fechaSalida: fechaSalida,
        //             fechaActual: fechaCreacion,
        //             apartamentosArray: apartamentosArray,
        //             capaImpuestos: "si"
        //         }
        //     }
        // })
        // // Ojo por que sobrescribe las ofertas existentes, debe de añadir en el array de ofertas por cocndicion otra mas
        // await actualizarDesgloseFinacieroPorSimulacionUID({
        //     desgloseFinanciero,
        //     simulacionUID
        // })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el conenedorFinanciero",
            contenedorFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}