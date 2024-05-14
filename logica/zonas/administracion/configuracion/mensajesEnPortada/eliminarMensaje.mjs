import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerMensajePorMensajeUID } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { campoDeTransaccion } from "../../../../componentes/campoDeTransaccion.mjs";
import { eliminarMensajeEnPortada } from "../../../../repositorio/configuracion/mensajesPortada/elminarMensajeEnPortada.mjs";
import { actualizaOrdenDePosiciones } from "../../../../repositorio/configuracion/mensajesPortada/actualizarOrdenDePosiciones.mjs";

export const eliminarMensaje = async (entrada, salida) => {
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
        salida.json(ok);

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}