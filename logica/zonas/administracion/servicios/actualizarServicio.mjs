import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { Mutex } from "async-mutex";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { obtenerServicioPorServicioUID } from "../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs";
import { validarServicio } from "../../../sistema/servicios/validarObjeto.mjs";
import { actualizarServicioPorServicioUID } from "../../../repositorio/servicios/actualizarServicioPorServicioUID.mjs";

export const actualizarServicio = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal de la servicioUID (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const servicio = await obtenerServicioPorServicioUID(servicioUID)
        const estadoServicio = servicio.estadoIDV;
        if (estadoServicio === "activado") {
            const error = "No se puede modificar un servicio activo. Primero desactivalo con el botón de estado.";
            throw new Error(error);
        }

        const servicioParaActualizar = {
            nombreServicio: entrada.body.nombreServicio,
            zonaIDV: entrada.body.zonaIDV,
            contenedor: entrada.body.contenedor
        };
        await validarServicio({
            servicio: servicioParaActualizar,
        })
        servicioParaActualizar.servicioUID = servicioUID
        await campoDeTransaccion("iniciar")
        const servicioActualizado = await actualizarServicioPorServicioUID(servicioParaActualizar);
        await campoDeTransaccion("confirmar")

        delete servicioActualizado.testingVI
        const ok = {
            ok: "El servicio se ha actualizado bien junto con los apartamentos dedicados",
            servicioActualizado: servicioActualizado
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