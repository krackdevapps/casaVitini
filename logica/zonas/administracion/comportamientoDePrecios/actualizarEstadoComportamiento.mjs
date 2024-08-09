import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { actualizarEstadoDelComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/actualizarEstadoDelComportamientoDePrecio.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const actualizarEstadoComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

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