import { Mutex } from "async-mutex";
import { actualizarSimulacionDesdeDataGlobal } from "../../../shared/contenedorFinanciero/entidades/simulacion/actualizarSimulacionDesdeDataGlobal_obsoleto.mjs";
import { validarDataGlobalSimulacion } from "../../../shared/contenedorFinanciero/entidades/simulacion/validarDataGlobalSimulacion.mjs";
import { actualizarRangoFechasPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs";
import { generarDesgloseSimpleGuardarlo } from "../../../shared/simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs";

export const actualizarSimulacionPorDataGlobal = async (entrada) => {
    const mutex = new Mutex()
    try {
        mutex.acquire()
        const dataValidada = await validarDataGlobalSimulacion(entrada.body)
        const fechaCreacion = dataValidada.fechaCreacion
        const fechaEntrada = dataValidada.fechaEntrada
        const fechaSalida = dataValidada.fechaSalida
        const simulacionUID = dataValidada.simulacionUID
        const zonaIDV = dataValidada.zonaIDV

        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            simulacionUID,
            zonaIDV
        })
        // const contenedorSimulacion = entrada.body
        // const desgloseFinancieroActualizado = await actualizarSimulacionDesdeDataGlobal(contenedorSimulacion)
        const desgloseFinanciero = await generarDesgloseSimpleGuardarlo(simulacionUID)
        const ok = {
            ok: "Se ha guardado la nueva simulación",
            simulacionUID: dataValidada.simulacionUID,
            desgloseFinanciero: desgloseFinanciero
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