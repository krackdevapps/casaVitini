import { obtenerServicioPorServicioUID } from "../../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { insertarServicioPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/servicios/insertarServicioPorSimulacionUID.mjs"

export const insertarServicioEnSimulacion = async (entrada) => {
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
            nombreCampo: "El identificador universal de la simulacion (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal del servicio (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const servicio = await obtenerServicioPorServicioUID(servicioUID)
        const nombreServicico = servicio.nombre
        const contenedorServicio = servicio.contenedor
        await campoDeTransaccion("iniciar")
        const servicioInsertado = await insertarServicioPorSimulacionUID({
            simulacionUID,
            nombre: nombreServicico,
            contenedor: contenedorServicio
        })

        // Validador para comprobar que se tiene los datos globales para hacer una genracioin de desglose financiero

        // Si hay datos globales, generamos desglose finacniero y enviamos el desglose financiero para que luego se reconstruya
        // Si no enviamos el ok, pero no eviamos le desglose financiero



        // // const desgloseFinanciero = await procesador({
        // //     entidades: {
        // //         reserva: {
        // //             origen: "hubReservas",
        // //             reservaUID: reservaUID
        // //         },
        // //         servicios: {
        // //             origen: "instantaneaServiciosEnReserva",
        // //             reservaUID: reservaUID
        // //         },
        // //     },
        // //     capas: {
        // //         impuestos: {
        // //             origen: "instantaneaImpuestos",
        // //             reservaUID: reservaUID
        // //         }
        // //     }
        // // })

        // const desgloseFinanciero = await procesador({
        //     entidades: {
        //         simulacion: {
        //             origen: "hubSimulaciones",
        //             simulacionUID
        //         },
        //         servicios: {
        //             origen: "instantaneaServiciosEnSimulacion",
        //             simulacionUID
        //         },
        //     },
        //     capas: {
        //         ofertas: {
        //             // zonasArray: ["global", "publica"],
        //             // configuracion: {
        //             //     descuentosPersonalizados: "no",
        //             //     descuentosArray: []
        //             // },
        //             // operacion: {
        //             //     tipo: "insertarDescuentosPorCondiconPorCoodigo",
        //             //     codigoDescuentosArrayBASE64: codigosDescuentosSiReconocidos
        //             // }
        //         },
        //         impuestos: {
        //             origen: "instantaneaSimulacion"
        //         }
        //     }
        // })

        // await actualizarDesgloseFinacieroPorSimulacionUID({
        //     desgloseFinanciero,
        //     simulacionUID
        // })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el servicio correctamente en la reserva y el contenedor financiero se ha renderizado.",
            servicio: servicioInsertado
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}