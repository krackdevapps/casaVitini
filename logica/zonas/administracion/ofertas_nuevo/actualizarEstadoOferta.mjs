import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerOferatPorOfertaUID } from "../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { actualizarEstadoOferata } from "../../../repositorio/ofertas/actualizarEstadoOferta.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const actualizarEstadoOferta = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const ofertaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.ofertaUID,
            nombreCampo: "El campo ofertaUID ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const estadoOferta = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoOferta,
            nombreCampo: "El campo estadoOferta",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // Validar nombre unico oferta
        await obtenerOferatPorOfertaUID(ofertaUID)
        await campoDeTransaccion("iniciar")

        const data = {
            ofertaUID:ofertaUID,
            estadoOferta:estadoOferta,
        }
        const ofertaActualizada = await actualizarEstadoOferata(data)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El estado de la oferta se ha actualziado correctamente",
            estadoOferta: ofertaActualizada.estadoOferta
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}