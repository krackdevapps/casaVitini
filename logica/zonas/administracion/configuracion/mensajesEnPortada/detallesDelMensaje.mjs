import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";

export const detallesDelMensaje = async (entrada, salida) => {
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
        const mensajesEnPortada = await obtenerMensajePorMensajeUID(mensajeUID)
        const bufferObjPreDecode = Buffer.from(mensajesEnPortada.mensaje, "base64");
        mensajesEnPortada.mensaje = bufferObjPreDecode.toString("utf8");
        const ok = {
            ok: mensajesEnPortada
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}