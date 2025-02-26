import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerServicioPorServicioUID } from "../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs";
import { eliminarServicioPorServicioUID } from "../../../infraestructure/repository/servicios/eliminarServicioPorServicioUID.mjs";

export const eliminarServicio = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal de la servicioUID (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await obtenerServicioPorServicioUID(servicioUID)
        await campoDeTransaccion("iniciar")
        await eliminarServicioPorServicioUID(servicioUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la oferta correctamente",
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