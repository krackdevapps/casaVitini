import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { procesador } from "../contenedorFinanciero/procesador.mjs"

export const generarDesgloseSimpleGuardarlo = async (simulacionUID) => {
    try {
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const zonaIDV = simulacion.zonaIDV
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
                complementosAlojamiento: {
                    origen: "instantaneaComplementosalojamientoEnSimulacion",
                    simulacionUID: simulacionUID
                },
            },
            capas: {
                ofertas: {
                    zonasArray: [zonaIDV],
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
        return desgloseFinanciero
    } catch (error) {
        throw error
    }
}
