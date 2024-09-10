import { actualizarRangoFechasPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { eliminarBloqueoCaducado } from "../../../bloqueos/eliminarBloqueoCaducado.mjs"
import { procesador } from "../../procesador.mjs"
import { validarDataGlobalSimulacion } from "./validarDataGlobalSimulacion.mjs"

export const actualizarSimulacionDesdeDataGlobal = async (data) => {
    try {

        const dataValidada = await validarDataGlobalSimulacion(data)

        const fechaCreacion = dataValidada.fechaCreacion
        const fechaEntrada = dataValidada.fechaEntrada
        const fechaSalida = dataValidada.fechaSalida
        const apartamentosIDVARRAY = dataValidada.apartamentosIDVARRAY
        const simulacionUID = dataValidada.simulacionUID
        const zonaIDV = dataValidada.zonaIDV


        await eliminarBloqueoCaducado()
        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentosIDVARRAY,
            simulacionUID,
            zonaIDV
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
                    configuracion: {
                        descuentosPersonalizados: "no",
                        descuentosArray: []
                    },
                    // operacion: {
                    //     tipo: "insertarDescuentosPorCondiconPorCoodigo",
                    //     codigoDescuentosArrayBASE64: codigosDescuentosSiReconocidos
                    // }
                },
                impuestos: {
                    origen: "hubImuestos"
                }
            }
        })

        await actualizarDesgloseFinacieroPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })
        return desgloseFinanciero
    } catch (errorCapturado) {
        throw errorCapturado
    }
}




