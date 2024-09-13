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
import { validarDataGlobalDeSimulacion } from "../../../../sistema/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"

export const insertarDescuentoPorCompatible = async (entrada) => {
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

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
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

            const m = "No se puede reconstruir este desglose financiero de esta reserva desde los hubs de precios, porque hay apartamentos que ya no existen como configuración de alojamiento en el hub de configuraciones de alojamiento."
            throw new Error(m)
        }

        await obtenerOferatPorOfertaUID(ofertaUID)
        await validarDataGlobalDeSimulacion(simulacionUID)
        await obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion({
            simulacionUID,
            ofertaUID,
            errorSi: "existe"
        })
      
        const desgloseFinanciero = await procesador({
            entidades: {
                simulacion: {
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
                        tipo:  "insertarDescuentoCompatibleConReserva",
                    },
                    ofertaUID: ofertaUID,
                    ignorarCodigosDescuentos: "si"
                },
                impuestos: {
                    origen: "instantaneaSimulacion",
                    simulacionUID: simulacionUID
                }
            }
        })
        // Ojo por que sobrescribe las ofertas existentes, debe de añadir en el array de ofertas por cocndicion otra mas
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
    } finally {
        mutex.release()
    }
}