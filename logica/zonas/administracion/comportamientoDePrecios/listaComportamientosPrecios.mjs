import { obtenerComportamientosOrdenadorPorFechaInicio } from "../../../repositorio/comportamientoDePrecios/obtenerTodosComportamientosOrdenadorPorFechaInicio.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const listaComportamientosPrecios = async (entrada, salida) => {

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const comportamientosDePrecio = await obtenerComportamientosOrdenadorPorFechaInicio()
        const ok = {};
        if (comportamientosDePrecio.length === 0) {
            ok.ok = "No hay comportamiento de precios configurados";
            return ok
        }

        const listaComportamientos = comportamientosDePrecio
        ok.ok = listaComportamientos;
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}