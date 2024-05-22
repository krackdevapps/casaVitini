import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerTodosLosMensjaes } from "../../../../repositorio/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs";
import { insertarMensajeEnPortada } from "../../../../repositorio/configuracion/mensajesPortada/insertarMensajeEnPortada.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";

export const crearMensaje = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mensaje = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensaje,
            nombreCampo: "El campo del mensaje",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const bufferObj = Buffer.from(mensaje, "utf8");
        const mensajeB64 = bufferObj.toString("base64");

        await campoDeTransaccion("iniciar")

        const todosLosMensajes = await obtenerTodosLosMensjaes()
        const posicionInicial = todosLosMensajes.length + 1;

        const dataNuevoMensaje = {
            mensajeB64: mensajeB64,
            estadoInicial: "desactivado",
            posicionInicial: posicionInicial
        }
        await insertarMensajeEnPortada(dataNuevoMensaje)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado el nuevo mensaje",
            mensajeUID: resuelveCreacion.rows[0].mensajeUID,
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    }

}