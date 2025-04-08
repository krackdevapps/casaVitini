import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { Mutex } from "async-mutex";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerServicioPorServicioUID } from "../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs";
import { validarServicio } from "../../../shared/servicios/validarObjeto.mjs";
import { actualizarServicioPorServicioUID } from "../../../infraestructure/repository/servicios/actualizarServicioPorServicioUID.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";

export const actualizarServicio = async (entrada) => {
    const mutex = new Mutex()
    try {
        await mutex.acquire()

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal de la servicioUID (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
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
        const servicioValidado = await validarServicio({
            servicio: servicioParaActualizar,
        })
        servicioValidado.servicioUID = servicioUID
        await campoDeTransaccion("iniciar")

        const servicioActualizado = await actualizarServicioPorServicioUID(servicioValidado);
        const gruposDeOpciones = servicioActualizado.contenedor.gruposDeOpciones

        for (const [grupoIDV, gDO] of Object.entries(gruposDeOpciones)) {
            const opcionesGrupo = gDO.opcionesGrupo
            for (const og of opcionesGrupo) {
                const elementoUID = og?.elementoEnlazado?.elementoUID
                const nombreOpcion = og.nombreOpcion
                if (elementoUID) {
                    const elemento = await obtenerElementoPorElementoUID({
                        elementoUID,
                        errorSi: "desactivado"
                    })
                    if (!elemento) {
                        throw new Error(`No se puede enlazar el elemento del inventario con la opción con nombre ${nombreOpcion} porque no se encuentra en el inventario`)
                    } else {
                        og.elementoEnlazado.nombre = elemento.nombre
                    }
                }
            }
        }

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