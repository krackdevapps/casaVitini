import { obtenerTodosLosServicio } from "../../../infraestructure/repository/servicios/obtenerTodosLosServicio.mjs";


export const obtenerServicios = async (entrada) => {
    try {


        const servicios = await obtenerTodosLosServicio()
        const ok = {
            ok: "Aquí tienes los servicios disponiles",
            servicios
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}