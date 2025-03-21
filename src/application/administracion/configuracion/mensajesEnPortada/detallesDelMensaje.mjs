import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";

export const detallesDelMensaje = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
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