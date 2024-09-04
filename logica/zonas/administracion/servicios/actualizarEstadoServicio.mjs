import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerOferatPorOfertaUID } from "../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { actualizarEstadoOferata } from "../../../repositorio/ofertas/actualizarEstadoOferta.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { obtenerServicioPorServicioUID } from "../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs";
import { actualizarEstadoServicioPorServicioUID } from "../../../repositorio/servicios/actualizarEstadoServicioPorServicioUID.mjs";

export const actualizarEstadoServicio = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal de la servicioUID (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const estadoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoIDV,
            nombreCampo: "El campo estadoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // Validar nombre unico oferta
        await obtenerServicioPorServicioUID(servicioUID)

        await campoDeTransaccion("iniciar")

        const data = {
            estadoIDV: estadoIDV,
            servicioUID: servicioUID,
        }
        const ofertaActualizada = await actualizarEstadoServicioPorServicioUID(data)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El estado del serviciola oferta se ha actualizado correctamente",
            estadoIDV: ofertaActualizada.estadoIDV
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