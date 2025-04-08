
import { obtenerRegistroPorRegistroUID } from "../../../infraestructure/repository/registro/obtenerRegistroPorRegistroUID.mjs";
import { validadorRegistroCompartido } from "../../../shared/registros/validadorRegistroCompartido.mjs";

export const obtenerDetallesDelRegistro = async (entrada) => {
    try {

        const elementoValidado = validadorRegistroCompartido({
            o: entrada.body,
            filtrosIDV: [
                "uid"
            ]
        })
        
        const uid = elementoValidado.uid
        const registro = await obtenerRegistroPorRegistroUID(uid)
        const ok = {
            ok: "Detalles del registro",
            registro
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}