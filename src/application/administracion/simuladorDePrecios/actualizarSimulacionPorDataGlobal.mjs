import { Mutex } from "async-mutex";
import { validarDataGlobalSimulacion } from "../../../shared/contenedorFinanciero/entidades/simulacion/validarDataGlobalSimulacion.mjs";
import { actualizarRangoFechasPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs";

import { soloFiltroDataGlobal } from "../../../shared/simuladorDePrecios/soloFiltroDataGlobal.mjs";

export const actualizarSimulacionPorDataGlobal = async (entrada) => {
    const mutex = new Mutex()
    try {


        mutex.acquire()
        const data = entrada.body


        const dataGlobalVal = await validarDataGlobalSimulacion(data)
        const fechaCreacion = dataGlobalVal.fechaCreacion
        const fechaEntrada = dataGlobalVal.fechaEntrada
        const fechaSalida = dataGlobalVal.fechaSalida
        const simulacionUID = dataGlobalVal.simulacionUID
        const zonaIDV = dataGlobalVal.zonaIDV



        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            simulacionUID,
            zonaIDV
        })

        const llavesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        const ok = {
            ok: "Se ha guardado la nueva simulación",
            simulacionUID: data.simulacionUID,
            llavesFaltantes
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