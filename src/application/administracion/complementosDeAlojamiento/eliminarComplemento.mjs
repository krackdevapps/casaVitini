import { Mutex } from "async-mutex";

import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/eliminarComplementoPorComplementoUID.mjs";
import { obtenerComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs";


export const eliminarComplemento = async (entrada) => {
    const mutex = new Mutex()
    try {


        await mutex.acquire();

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal del complementoUID (complementoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
        await campoDeTransaccion("iniciar")
        await eliminarComplementoPorComplementoUID(complementoUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el complemento correctamente",
            apartamentoIDV: complemento.apartamentoIDV

        }
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