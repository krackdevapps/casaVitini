import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerMensajePorMensajeUID } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { obtenerMensajePorPosicion } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorPosicion.mjs";
import { obtenerTodosLosMensjaes } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs";
import { actualizarPosicionDelMensajeDePortada } from "../../../../infraestructure/repository/configuracion/mensajesPortada/actualizarPosicionMensajeDePortada.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";


export const moverPosicion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
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
            devuelveUnTipoNumber: "si"
        })
        const nuevaPosicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaPosicion,
            nombreCampo: "El campo nuevaPosicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const mensajeDePortadaa = await obtenerMensajePorMensajeUID(mensajeUID)
        const posicionAntigua = mensajeDePortadaa.posicion;
        if (Number(posicionAntigua) === Number(nuevaPosicion)) {
            const error = "El mensaje ya esta en esa posicion";
            throw new Error(error);
        }

        const todosLosMensaje = await obtenerTodosLosMensjaes()
        const totalMensajes = todosLosMensaje.length

        if (Number(totalMensajes) === 1) {
            const error = "Solo hay un mensaje, por lo tanto, mover la posición es irrelevante.";
            throw new Error(error);
        }

        if (Number(totalMensajes) < Number(nuevaPosicion)) {
            const error = "La posición no puede ser superior a: " + totalMensajes;
            throw new Error(error);
        }

        const mensajeSeleccionado = {};
        const mensajeSeleccionado_texto = mensajeDePortadaa.mensaje;
        const bufferObjPreDecode = Buffer.from(mensajeSeleccionado_texto, "base64");

        mensajeSeleccionado.mensajeUID = mensajeUID;
        mensajeSeleccionado.mensaje = bufferObjPreDecode.toString("utf8");
        mensajeSeleccionado.estadoIDV = mensajeDePortadaa.estadoIDV;

        const detallesMensajeAfectado = await obtenerMensajePorPosicion(nuevaPosicion)

        const mensajeUIDAfectado = detallesMensajeAfectado.mensajeUID;
        const mensajeUIDAfectado_mensaje = detallesMensajeAfectado.mensaje;
        const buffer_mensajeAfectado = Buffer.from(mensajeUIDAfectado_mensaje, "base64");

        const mensajeAfectado = {
            mensajeUID: mensajeUIDAfectado,
            mensaje: buffer_mensajeAfectado.toString("utf8"),
            estadoIDV: detallesMensajeAfectado.estadoIDV
        };
        await campoDeTransaccion("iniciar")

        const dataActualizarPosicionDelMensaje_1 = {
            mensajeUID: mensajeUIDAfectado,
            posicion: "0"
        }
        await actualizarPosicionDelMensajeDePortada(dataActualizarPosicionDelMensaje_1)

        const dataActualizarPosicionDelMensajeActual = {
            mensajeUID: mensajeUID,
            posicion: nuevaPosicion
        }
        await actualizarPosicionDelMensajeDePortada(dataActualizarPosicionDelMensajeActual)

        // Posicion de final a elementoAfectado
        const dataActualizarPosicionDelMensajeFinal = {
            mensajeUID: mensajeUIDAfectado,
            posicion: posicionAntigua
        }
        await actualizarPosicionDelMensajeDePortada(dataActualizarPosicionDelMensajeFinal)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la posición",
            mensajeSeleccionado: mensajeSeleccionado,
            mensajeAfectado: mensajeAfectado
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

} 