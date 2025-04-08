
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { actualizarEstadoMensajeDePortada } from "../../../../infraestructure/repository/configuracion/mensajesPortada/actualizarEstadoMensajeDePortada.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";


export const actualizarEstado = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const estadoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoIDV,
            nombreCampo: "El estadoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")
        await obtenerMensajePorMensajeUID(mensajeUID)

        const dataActualizarEstadoMensaje = {
            mensajeUID: mensajeUID,
            estadoIDV: estadoIDV
        }
        await actualizarEstadoMensajeDePortada(dataActualizarEstadoMensaje)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el estado correctamente",
            mensajeUID: mensajeUID,
            estadoIDV: estadoIDV
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}