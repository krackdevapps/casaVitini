import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/obtenerConfiguracionDeProtocolos.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const configuracion = await obtenerConfiguracionDeProtocolos()

        const ok = {
            ok: "Configuración de los protocolos de alojamiento",
            configuracion
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}