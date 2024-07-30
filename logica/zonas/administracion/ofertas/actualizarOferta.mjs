import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { Mutex } from "async-mutex";
import { obtenerOferatPorOfertaUID } from "../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { validarObjetoOferta } from "../../../sistema/ofertas/entidades/reserva/validarObjetoOferta.mjs";
import { actualizarOfertaPorOfertaUID } from "../../../repositorio/ofertas/actualizarOfertaPorOfertaUID.mjs";

export const actualizarOferta = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire()

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const oferta = await obtenerOferatPorOfertaUID(ofertaUID)
        const estadoOferta = oferta.estadoIDV;
        if (estadoOferta === "activado") {
            const error = "No se puede modificar una oferta activa. Primero desactiva con el boton de estado.";
            throw new Error(error);
        }

        const nombreOferta = entrada.body.nombreOferta
        const zonaIDV = entrada.body.zonaIDV
        const entidadIDV = entrada.body.entidadIDV
        const fechaInicio = entrada.body.fechaInicio
        const fechaFinal = entrada.body.fechaFinal
        const condicionesArray = entrada.body.condicionesArray
        const descuentosJSON = entrada.body.descuentosJSON

        const ofertaPorActualizar = {
            nombreOferta,
            zonaIDV,
            entidadIDV,
            fechaInicio,
            fechaFinal,
            condicionesArray,
            descuentosJSON,
            ofertaUID
        }
        await validarObjetoOferta({
            oferta: ofertaPorActualizar,
            modo: "actualizarOferta"
        })
        await campoDeTransaccion("iniciar")
        const ofertaActualizada = await actualizarOfertaPorOfertaUID(ofertaPorActualizar);
        await campoDeTransaccion("confirmar")

        ofertaActualizada.condicionesArray.forEach((condicion) => {
            const tipoCondicion = condicion.tipoCondicion
            if (tipoCondicion === "porCodigoDescuento") {
                const codigoDescuentoB64 = condicion.codigoDescuento
                condicion.codigoDescuento = Buffer.from(codigoDescuentoB64, 'base64').toString('utf-8');
            }
        })

        const ok = {
            ok: "La oferta  se ha actualizado bien junto con los apartamentos dedicados",
            ofertaActualizada: ofertaActualizada
        };
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