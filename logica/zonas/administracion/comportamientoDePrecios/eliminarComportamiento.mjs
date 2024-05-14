import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoDePrecioPorComportamientoUID.mjs";
import { campoDeTransaccion } from "../../../componentes/campoDeTransaccion.mjs";
import { eliminarComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/eliminarComportamientoDePrecio.mjs";

export const eliminarComportamiento = async (entrada, salida) => {
    let mutex
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
        await eliminarComportamientoDePrecio(comportamientoUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el comportamiento correctamente",
        };
        salida.json(ok);

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}