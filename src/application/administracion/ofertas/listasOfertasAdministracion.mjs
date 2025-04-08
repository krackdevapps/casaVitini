import { obtenerTodasLasOfertas } from "../../../infraestructure/repository/ofertas/obtenerTodasLasOfertas.mjs";


export const listasOfertasAdministracion = async (entrada) => {
    try {


        const listaDeOfertas = await obtenerTodasLasOfertas()


        const ok = {
            ok: listaDeOfertas
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}