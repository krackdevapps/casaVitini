import { Mutex } from "async-mutex";
import { evitarDuplicados } from "../../../sistema/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { insertarComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/insertarComportamientoDePrecio.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { validarComportamiento } from "./validarComportamiento.mjs";

export const crearComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        await mutex.acquire();
        const comportamiento = {
            nombreComportamiento: entrada.body.nombreComportamiento,
            estadoInicalDesactivado: "desactivado",
            contenedor: entrada.body.contenedor,
            transaccion: "crear"
        }
        await validarComportamiento(comportamiento)

        await campoDeTransaccion("iniciar")
        // const dataEvitarDuplicados = {
        //     tipo: tipo,
        //     transaccion: "crear",
        //     apartamentos: apartamentos,
        //     fechaInicio_ISO: fechaInicio_ISO,
        //     fechaFinal_ISO: fechaFinal_ISO,
        //     diasArray: diasArray
        // };

        // await evitarDuplicados(dataEvitarDuplicados);
        const nuevoComportamiento = await insertarComportamientoDePrecio(comportamiento)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado correctamente el comportamiento",
            nuevoComportamiento: nuevoComportamiento
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