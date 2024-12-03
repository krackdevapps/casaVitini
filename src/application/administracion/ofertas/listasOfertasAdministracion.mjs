import { obtenerTodasLasOfertas } from "../../../infraestructure/repository/ofertas/obtenerTodasLasOfertas.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

export const listasOfertasAdministracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const listaDeOfertas = await obtenerTodasLasOfertas()
     

        const ok = {
            ok: listaDeOfertas
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}