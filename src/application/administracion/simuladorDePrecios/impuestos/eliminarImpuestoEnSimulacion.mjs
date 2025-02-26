import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerImpuestoPorImpuestoUIDPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/obtenerImpuestoPorImpuestoUIDPorSimulacionUID.mjs"
import { eliminarImpuestoPorImpuestoUIDPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarImpuestoPorImpuestoUIDPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"

export const eliminarImpuestoEnSimulacion = async (entrada) => {
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

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        mutex.acquire()
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await obtenerImpuestoPorImpuestoUIDPorSimulacionUID({
            simulacionUID,
            impuestoUID: String(impuestoUID),
            errorSi: "noExiste"
        })

        await campoDeTransaccion("iniciar")

        await eliminarImpuestoPorImpuestoUIDPorSimulacionUID({
            simulacionUID,
            impuestoUID
        })
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el conenedorFinanciero",
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}