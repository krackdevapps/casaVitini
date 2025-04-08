
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { actualizarEstadoDelComportamientoDePrecio } from "../../../infraestructure/repository/comportamientoDePrecios/actualizarEstadoDelComportamientoDePrecio.mjs";
import { semaforoCompartidoReserva } from "../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";


export const actualizarEstadoComportamiento = async (entrada, salida) => {

    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        await semaforoCompartidoReserva.acquire();
        const comportamientoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la reserva (comportamientoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
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
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release();
        }
    }
}