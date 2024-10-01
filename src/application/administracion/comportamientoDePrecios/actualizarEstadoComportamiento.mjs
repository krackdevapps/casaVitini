import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { actualizarEstadoDelComportamientoDePrecio } from "../../../infraestructure/repository/comportamientoDePrecios/actualizarEstadoDelComportamientoDePrecio.mjs";

export const actualizarEstadoComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        await mutex.acquire();
        const comportamientoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la reserva (comportamientoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const estadoPropuesto = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoPropuesto,
            nombreCampo: "El estadoPropuesto",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")
        await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        const comportamientoActualizado = await actualizarEstadoDelComportamientoDePrecio({
            estadoPropuesto,
            comportamientoUID
        })



        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El estado del comportamiento se ha actualizado correctamente.",
            estadoComportamiento: comportamientoActualizado.estadoIDV
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release();
    }
}