import { obtenerComportamientosOrdenadorPorFechaInicio } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerTodosComportamientosOrdenadorPorFechaInicio.mjs";



export const listaComportamientosPrecios = async (entrada) => {

    try {


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