import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";

export const obtenerTelefono = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const dadaObtenerPares = [
            "telefonoPublicoWhatsApp"
        ]
        const paresConfiguracion = await obtenerParametroConfiguracion(dadaObtenerPares)
        const ok = {
            ok: paresConfiguracion
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }

}