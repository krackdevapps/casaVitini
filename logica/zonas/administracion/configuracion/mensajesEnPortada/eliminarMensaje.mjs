import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { eliminarMensajeEnPortada } from "../../../../repositorio/configuracion/mensajesPortada/elminarMensajeEnPortada.mjs";
import { actualizaOrdenDePosiciones } from "../../../../repositorio/configuracion/mensajesPortada/actualizarOrdenDePosiciones.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarMensaje = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await campoDeTransaccion("iniciar")
        const mensajeEnPortada = await obtenerMensajePorMensajeUID(mensajeUID)
        const posicion = mensajeEnPortada.posicion;
        await eliminarMensajeEnPortada(mensajeUID)
        await actualizaOrdenDePosiciones(posicion)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado correctamente el mensaje de portada",
            mensajeUID: mensajeUID
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}