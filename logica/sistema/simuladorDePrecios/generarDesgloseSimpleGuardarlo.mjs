import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { procesador } from "../contenedorFinanciero/procesador.mjs"

export const generarDesgloseSimpleGuardarlo = async (simulacionUID) => {

    try {
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const zonaIDV = simulacion.zonaIDV
        console.log("simulacionUID >>> ", simulacionUID)
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
