import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { eliminarComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/eliminarComportamientoDePrecioPorComportamientoUID.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";

export const eliminarComportamiento = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex = new Mutex()
        await mutex.acquire();

        const comportamientoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la habitación (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        await campoDeTransaccion("iniciar")
        await eliminarComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el comportamiento correctamente",
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}