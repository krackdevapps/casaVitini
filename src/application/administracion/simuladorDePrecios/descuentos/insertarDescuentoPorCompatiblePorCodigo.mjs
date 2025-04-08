import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"

import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { soloFiltroDataGlobal } from "../../../../shared/simuladorDePrecios/soloFiltroDataGlobal.mjs"
import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs"

export const insertarDescuentoPorCompatiblePorCodigo = async (entrada) => {
    const mutex = new Mutex()
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
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
            const m = `No se puede insertar un descuento compatible por codigo en la simulacion, por que faltan los siguientes datos globales de la simulacion: ${llavesSring}`
            throw new Error(m)
        }
        const alojamiento = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)
        const apartamentosArray = alojamiento.map(a => a.apartamentoIDV)
        const zonaIDV = simulacion.zonaIDV

        try {
            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }
        } catch (error) {

            const m = "No se puede reconstruir este desglose financiero de esta reserva desde los hubs de precios, porque hay apartamentos que ya no existen como configuración de alojamiento en el hub de configuraciones de alojamiento."
            throw new Error(m)
        }

        await obtenerOferatPorOfertaUID(ofertaUID)
        await obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion({
            simulacionUID,
            ofertaUID,
            errorSi: "existe"
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "hubSimulaciones",
                    simulacionUID: simulacionUID
                },
                servicios: {
                    origen: "instantaneaServiciosEnSimulacion",
                    simulacionUID: simulacionUID
                },
            },
            capas: {
                ofertas: {
                    zonasArray: [zonaIDV],
                    operacion: {
                        tipo: "insertarDescuentoCompatibleConReserva",
                    },
                    ofertaUID: ofertaUID,
                    codigoDescuentosArrayBASE64: codigosDescuentoArray,
                    ignorarCodigosDescuentos: "no"
                },
                impuestos: {
                    origen: "instantaneaSimulacion",
                    simulacionUID: simulacionUID
                }
            }
        })
        await actualizarDesgloseFinacieroPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el conenedorFinanciero",
            simulacionUID,
            desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}