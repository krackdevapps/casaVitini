import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerServicioPorServicioUID } from "../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs";
import { actualizarEstadoServicioPorServicioUID } from "../../../infraestructure/repository/servicios/actualizarEstadoServicioPorServicioUID.mjs";
import { obtenerComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs";
import { actualizarEstadoIDVPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/actualizarEstadoIDVPorComplementoUID.mjs";

export const actualizarEstado = async (entrada, salida) => {
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

        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal de la complementoUID",
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
        const estadosIDV = [
            "activado",
            "desactivado"
        ]

        if (!estadosIDV.includes(estadoIDV)) {
            const m = "El campo estadoIDV solo espepra activado o desactivado"
            throw new Error(m)

        }
        await campoDeTransaccion("iniciar")
        await obtenerComplementoPorComplementoUID(complementoUID)
        const complementoActualizado = await actualizarEstadoIDVPorComplementoUID({
            estadoIDV: estadoIDV,
            complementoUID: complementoUID,
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El estado del complemento se ha actualizado correctamente",
            estadoIDV: complementoActualizado.estadoIDV
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