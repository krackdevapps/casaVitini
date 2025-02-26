import { evitarDuplicados } from "../../../shared/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarComportamientoDePrecio } from "../../../infraestructure/repository/comportamientoDePrecios/actualizarComportamientoDePrecio.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { validarComportamiento } from "../../../shared/contenedorFinanciero/comportamientoPrecios/validarComportamiento.mjs";
import { semaforoCompartidoReserva } from "../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const actualizarComportamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        await semaforoCompartidoReserva.acquire();
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
            const error = "No se puede modificar un comportamiento de precio que está activo. Primero desactívalo con el botón de estado de color rojo en la parte superior izquierda, al lado del nombre.";
            throw new Error(error);
        }

        const comportamientoActualizado = await actualizarComportamientoDePrecio({
            nombreComportamiento: comportamiento.nombreComportamiento,
            contenedor: comportamiento.contenedor,
            comportamientoUID: comportamientoUID
        })

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
            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados.",
            comportamientoActualizado,
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