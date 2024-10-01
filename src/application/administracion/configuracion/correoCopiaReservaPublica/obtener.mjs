import { obtenerParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";

export const obtener = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const dadaObtenerPares = [
            "correoCopiaReservaPublica"
        ]
        const paresConfiguracion = await obtenerParConfiguracion(dadaObtenerPares)
        paresConfiguracion.correoCopiaReservaPublica = !paresConfiguracion.correoCopiaReservaPublica ? "" :
            paresConfiguracion.correoCopiaReservaPublica
        const ok = {
            ok: paresConfiguracion
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }

}