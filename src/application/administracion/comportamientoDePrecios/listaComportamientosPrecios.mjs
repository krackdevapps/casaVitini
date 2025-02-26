import { obtenerComportamientosOrdenadorPorFechaInicio } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerTodosComportamientosOrdenadorPorFechaInicio.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";


export const listaComportamientosPrecios = async (entrada) => {

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const comportamientosDePrecio = await obtenerComportamientosOrdenadorPorFechaInicio()
        const ok = {
            ok: "Aquí tiene los comportamientos de precios",
            comportamientosDePrecio: comportamientosDePrecio
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}