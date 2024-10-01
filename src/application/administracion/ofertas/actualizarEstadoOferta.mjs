import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerOferatPorOfertaUID } from "../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { actualizarEstadoOferata } from "../../../infraestructure/repository/ofertas/actualizarEstadoOferta.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const actualizarEstadoOferta = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const estadoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoIDV,
            nombreCampo: "El campo estadoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // Validar nombre unico oferta
        await obtenerOferatPorOfertaUID(ofertaUID)
        await campoDeTransaccion("iniciar")

        const data = {
            ofertaUID: ofertaUID,
            estadoIDV: estadoIDV,
        }
        const ofertaActualizada = await actualizarEstadoOferata(data)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El estado de la oferta se ha actualizado correctamente",
            estadoIDV: ofertaActualizada.estadoIDV
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