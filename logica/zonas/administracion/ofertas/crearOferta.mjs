import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { obtenerOfertasPorNombreUI } from "../../../repositorio/ofertas/obtenerOfertasPorNombreUI.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { insertarOferta } from "../../../repositorio/ofertas/insertarOferta.mjs";
import { validarObjetoOferta } from "../../../sistema/ofertas/entidades/reserva/validarObjetoOferta.mjs";

export const crearOferta = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const nombreOferta = entrada.body.nombreOferta
        const zonaIDV = entrada.body.zonaIDV
        const entidadIDV = entrada.body.entidadIDV
        const fechaInicio = entrada.body.fechaInicio
        const fechaFinal = entrada.body.fechaFinal
        const condicionesArray = entrada.body.condicionesArray
        const descuentosJSON = entrada.body.descuentosJSON
        const estadoInicial = "desactivado"

        const oferta = {
            nombreOferta,
            zonaIDV,
            entidadIDV,
            fechaInicio,
            fechaFinal,
            condicionesArray,
            descuentosJSON,
            estado: estadoInicial
        }
        await validarObjetoOferta(oferta)
        await campoDeTransaccion("iniciar")
        const ofertasPorNombre = await obtenerOfertasPorNombreUI(nombreOferta)
        if (ofertasPorNombre.length > 0) {
            const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones";
            throw new Error(error);
        }

        const nuevaOferta = await insertarOferta(oferta)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado la oferta",
            oferta: nuevaOferta
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