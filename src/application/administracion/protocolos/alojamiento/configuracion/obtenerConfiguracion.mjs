
import { obtenerConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/obtenerConfiguracionDeProtocolos.mjs";

export const obtenerConfiguracion = async () => {
    try {
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