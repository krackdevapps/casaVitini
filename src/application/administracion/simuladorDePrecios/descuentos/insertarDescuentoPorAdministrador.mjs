import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../shared/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarDescuentoPorAdministrador = async (entrada) => {
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
            nombreCampo: "El identificador universal de la reserva (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await validarDataGlobalDeSimulacion(simulacionUID)
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
            contenedorFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}