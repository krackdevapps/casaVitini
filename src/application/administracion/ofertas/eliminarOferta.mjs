import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerOferatPorOfertaUID } from "../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { eliminarOfertaPorOfertaUID } from "../../../infraestructure/repository/ofertas/eliminarOfertaPorOfertaUID.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const eliminarOferta = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la reserva (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await obtenerOferatPorOfertaUID(ofertaUID)
        await campoDeTransaccion("iniciar")
        await eliminarOfertaPorOfertaUID(ofertaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la oferta correctamente",
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}