import { Mutex } from "async-mutex";
import { evitarDuplicados } from "../../../sistema/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { actualizarComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/actualizarComportamientoDePrecio.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { validarComportamiento } from "./validarComportamiento.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const actualizarComportamiento = async (entrada, salida) => {
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

        const comportamiento = {
            nombreComportamiento: entrada.body.nombreComportamiento,
            contenedor: entrada.body.contenedor,
            comportamientoUID: comportamientoUID,
            transaccion: "actualizar"
        }
        await validarComportamiento(comportamiento)
        await campoDeTransaccion("iniciar")
        const dataEvitarDuplicados = {
            transaccion: "actualizar",
            comportamiento
        }
        await evitarDuplicados(dataEvitarDuplicados)
        const comportamientoDePrecio = await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        const estadoComportamiento = comportamientoDePrecio?.estadoIDV;
        if (estadoComportamiento === "activado") {
            const error = "No se puede modificar un comportamiento de precio que esta activo. Primero desativalo con el boton de estado de color rojo en la parte superior izquierda, al lado del nombre.";
            throw new Error(error);
        }

        const comportamientoActualizado = await actualizarComportamientoDePrecio({
            nombreComportamiento: comportamiento.nombreComportamiento,
            contenedor: comportamiento.contenedor,
            comportamientoUID: comportamientoUID
        })
        // AÑadir el apartametnoUI al objeto.
        const apartamentos = comportamientoActualizado.contenedor.apartamentos
        for (const apartamento of apartamentos) {

            const apartamentoIDV = apartamento.apartamentoIDV
            apartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })).apartamentoUI
        }
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
            comportamientoActualizado,
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release();
    }
}