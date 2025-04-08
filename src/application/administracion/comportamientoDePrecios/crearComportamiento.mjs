import { evitarDuplicados } from "../../../shared/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";

import { insertarComportamientoDePrecio } from "../../../infraestructure/repository/comportamientoDePrecios/insertarComportamientoDePrecio.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validarComportamiento } from "../../../shared/contenedorFinanciero/comportamientoPrecios/validarComportamiento.mjs";
import { semaforoCompartidoReserva } from "../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";


export const crearComportamiento = async (entrada) => {
    try {

        await semaforoCompartidoReserva.acquire();


        const oVal = await validarComportamiento({
            nombreComportamiento: entrada.body.nombreComportamiento,
            estadoInicialDesactivado: "desactivado",
            contenedor: entrada.body.contenedor,
            estadoInicialDesactivado: "crear",
        })
        const comportamiento = {
            nombreComportamiento: oVal.nombreComportamiento,
            estadoInicialDesactivado: "desactivado",
            contenedor: oVal.contenedor,
            estadoInicialDesactivado: "crear",
        }

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
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release();
        }
    }
}