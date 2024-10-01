import { obtenerParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
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
        const paresConfiguracion = await obtenerParConfiguracion(dadaObtenerPares)
        paresConfiguracion.telefonoPublicoWhatsApp = !paresConfiguracion.telefonoPublicoWhatsApp ? "" :
            paresConfiguracion.telefonoPublicoWhatsApp
        const ok = {
            ok: paresConfiguracion
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }

}