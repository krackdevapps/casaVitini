import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerServicioPorServicioUID } from "../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs";
import { actualizarEstadoServicioPorServicioUID } from "../../../infraestructure/repository/servicios/actualizarEstadoServicioPorServicioUID.mjs";

export const actualizarEstadoServicio = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal de la servicioUID (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const estadoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoIDV,
            nombreCampo: "El campo estadoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const estadosIDV = [
            "activado",
            "desactivado"
        ]

        if (!estadosIDV.includes(estadoIDV)) {
            const m = "El campo estadoIDV solo espepra activado o desactivado"
            throw new Error(m)

        }
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