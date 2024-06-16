import { obtenerTodasLasOfertas } from "../../../repositorio/ofertas/obtenerTodasLasOfertas.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const listasOfertasAdministracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        const listaDeOfertas = await obtenerTodasLasOfertas()
        const ok = {
            ok: listaDeOfertas
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}