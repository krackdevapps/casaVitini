import { obtenerTodosLosServicio } from "../../../infraestructure/repository/servicios/obtenerTodosLosServicio.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

export const obtenerServicios = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
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