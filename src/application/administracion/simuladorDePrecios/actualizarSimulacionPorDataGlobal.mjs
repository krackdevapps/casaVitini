import { Mutex } from "async-mutex";
import { validarDataGlobalSimulacion } from "../../../shared/contenedorFinanciero/entidades/simulacion/validarDataGlobalSimulacion.mjs";
import { actualizarRangoFechasPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { controladorGeneracionDesgloseFinanciero } from "../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs";

export const actualizarSimulacionPorDataGlobal = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        mutex.acquire()
        const data = entrada.body

        await validarDataGlobalSimulacion(data)
        const fechaCreacion = data.fechaCreacion
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const simulacionUID = data.simulacionUID
        const zonaIDV = data.zonaIDV

        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            simulacionUID,
            zonaIDV
        })

        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        const ok = {
            ok: "Se ha guardado la nueva simulación",
            simulacionUID: data.simulacionUID,
            ...postProcesadoSimualacion
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