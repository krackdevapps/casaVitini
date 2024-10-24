import { Mutex } from "async-mutex";
import { evitarDuplicados } from "../../../shared/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { insertarComportamientoDePrecio } from "../../../infraestructure/repository/comportamientoDePrecios/insertarComportamientoDePrecio.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validarComportamiento } from "../../../shared/contenedorFinanciero/comportamientoPrecios/validarComportamiento.mjs";

export const crearComportamiento = async (entrada) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        await mutex.acquire();
        const comportamiento = {
            nombreComportamiento: entrada.body.nombreComportamiento,
            estadoInicialDesactivado: "desactivado",
            contenedor: entrada.body.contenedor,
            estadoInicialDesactivado: "crear",
        }


        await validarComportamiento(comportamiento)
        await campoDeTransaccion("iniciar")

        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            comportamiento.testingVI = testingVI
        }

        const dataEvitarDuplicados = {
            transaccion: "crear",
            comportamiento

        };

        await evitarDuplicados(dataEvitarDuplicados);
        const nuevoComportamiento = await insertarComportamientoDePrecio(comportamiento)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado correctamente el comportamiento",
            comportamientoUID: nuevoComportamiento.comportamientoUID,
            estadoInicial: "desactivado"
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