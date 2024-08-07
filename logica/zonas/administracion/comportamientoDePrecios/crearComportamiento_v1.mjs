import { Mutex } from "async-mutex";
import { evitarDuplicados } from "../../../sistema/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const crearComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();
    try {
        await mutex.acquire();
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex = new Mutex()
        await mutex.acquire();
        const nombreComportamiento = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreComportamiento,
            nombreCampo: "El campo del nombreComportamiento",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await campoDeTransaccion("iniciar")

        const dataEvitarDuplicados = {
            nombreComportamiento: nombreComportamiento,
            transaccion: "actualizar",
        };

        await evitarDuplicados(dataEvitarDuplicados);
        await campoDeTransaccion("confirmar");
        const ok = {
            ok: "Se ha creado correctamente el comportamiento",
            nuevoUIDComportamiento: nuevoUIDComportamiento
        };
        return ok


    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}