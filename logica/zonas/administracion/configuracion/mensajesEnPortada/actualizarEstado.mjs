import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { actualizarEstadoMensajeDePortada } from "../../../../repositorio/configuracion/mensajesPortada/actualizarEstadoMensajeDePortada.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";

export const actualizarEstado = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const estado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estado,
            nombreCampo: "El estado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")
        await obtenerMensajePorMensajeUID(mensajeUID)

        const dataActualizarEstadoMensaje = {
            mensajeUID: mensajeUID,
            estado: estado
        }
        await actualizarEstadoMensajeDePortada(dataActualizarEstadoMensaje)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el estado correctamente",
            mensajeUID: mensajeUID,
            estado: estado
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    }

}