import { Mutex } from "async-mutex";

import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerOferatPorOfertaUID } from "../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { actualizarEstadoOferata } from "../../../infraestructure/repository/ofertas/actualizarEstadoOferta.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";


export const actualizarEstadoOferta = async (entrada, salida) => {
    const mutex = new Mutex()
    try {


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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const estadoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoIDV,
            nombreCampo: "El campo estadoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })


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