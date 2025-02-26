import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarComportamientoDePrecioPorComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/eliminarComportamientoDePrecioPorComportamientoUID.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { semaforoCompartidoReserva } from "../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const eliminarComportamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
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

        await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        await campoDeTransaccion("iniciar")
        await eliminarComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el comportamiento correctamente",
        }
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