import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { Mutex } from "async-mutex";
import { actualizarSimulacionDesdeDataGlobal } from "../../../sistema/contenedorFinanciero/entidades/simulacion/actualizarSimulacionDesdeDataGlobal.mjs";
import { validarDataGlobalSimulacion } from "../../../sistema/contenedorFinanciero/entidades/simulacion/validarDataGlobalSimulacion.mjs";

export const actualizarSimulacionPorDataGlobal = async (entrada) => {
    const mutex = new Mutex()
    try {
        const dataValidada = await validarDataGlobalSimulacion(entrada.body)
        mutex.acquire()
        const contenedorSimulacion = entrada.body
        const desgloseFinancieroActualizado = await actualizarSimulacionDesdeDataGlobal(contenedorSimulacion)
        const ok = {
            ok: "Se ha guardado la nueva simulación",
            simulacionUID: dataValidada.simulacionUID,
            desgloseFinanciero: desgloseFinancieroActualizado
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}