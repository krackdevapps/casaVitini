import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerImpuestosPorImppuestoUID } from "../../../../repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { insertarImpuestoPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/insertarImpuestoPorSimulacionUID.mjs"
import { obtenerImpuestoPorImpuestoUIDPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/obtenerImpuestoPorImpuestoUIDPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"

export const insertarImpuestoEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await obtenerImpuestoPorImpuestoUIDPorSimulacionUID({
            simulacionUID,
            impuestoUID,
            errorSi: "existe"
        })

        // Insertar el impuesto en la instantanea
        const impuesto = await obtenerImpuestosPorImppuestoUID(impuestoUID)
        await campoDeTransaccion("iniciar")
        await insertarImpuestoPorSimulacionUID({
            simulacionUID,
            impuesto
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                simulacion: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    simulacionUID
                }
            },
        })
        await actualizarDesgloseFinacieroPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el impuesto correctamente en la reserva y el contenedor financiero se ha renderizado.",
            simulacionUID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}