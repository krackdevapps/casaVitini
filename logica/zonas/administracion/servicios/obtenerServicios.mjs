import { obtenerTodosLosServicio } from "../../../repositorio/servicios/obtenerTodosLosServicio.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const obtenerServicios = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

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