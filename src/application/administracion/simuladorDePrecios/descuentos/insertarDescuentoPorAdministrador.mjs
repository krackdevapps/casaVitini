import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"

import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs"
import { soloFiltroDataGlobal } from "../../../../shared/simuladorDePrecios/soloFiltroDataGlobal.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarDescuentoPorAdministrador = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la reserva (simulacionUID)",
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
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const llavesGlobalesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        if (llavesGlobalesFaltantes.length > 0) {
            const llavesSring = utilidades.constructorComasEY({
                array: llavesGlobalesFaltantes,
                articulo: ""
            })
            const m = `No se puede insertar un descuento administrativo en la simulacion, por que faltan los siguientes datos globales de la simulacion: ${llavesSring}`
            throw new Error(m)
        }
        const zonaIDV = simulacion.zonaIDV

        await obtenerOferatPorOfertaUID(ofertaUID)
        await campoDeTransaccion("iniciar")

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
                        tipo: "insertarDescuentoPorAdministrador",
                    },
                    ofertaUID: ofertaUID
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
    }
}