import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";

import { actualizarContenidoMensajeDePortada } from "../../../../repositorio/configuracion/mensajesPortada/actualizarContenidoMensajeDePortada.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";

export const actualizarMensaje = async (entrada, salida) => {
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
            devuelveUnTipoNumber: "si"
        })
        const mensaje = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensaje,
            nombreCampo: "El campo del mensaje",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const bufferObj = Buffer.from(mensaje, "utf8");
        const mensajeB64 = bufferObj.toString("base64");

        const mensajeEnPortada = await obtenerMensajePorMensajeUID(mensajeUID)
        const estadoActual = mensajeEnPortada.estadoIDV;
        if (estadoActual !== "desactivado") {
            const error = "No se puede modificar un mensaje activo, primero desactiva el mensaje";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        const dataActualizarContenidoMensajePortada = {
            mensajeB64: mensajeB64,
            mensajeUID: mensajeUID
        }
        await actualizarContenidoMensajeDePortada(dataActualizarContenidoMensajePortada)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente el interruptor",
            mensajeUID: mensajeUID
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}