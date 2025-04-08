
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerServicioPorServicioUID } from "../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";

export const detallesServicio = async (entrada, salida) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal del servicioUID (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const servicio = await obtenerServicioPorServicioUID(servicioUID)
        const gruposDeOpciones = servicio.contenedor.gruposDeOpciones

        for (const [grupoIDV, gDO] of Object.entries(gruposDeOpciones)) {
            const opcionesGrupo = gDO.opcionesGrupo
            for (const og of opcionesGrupo) {
                const elementoUID = og?.elementoEnlazado?.elementoUID
                if (elementoUID) {
                    const elemento = await obtenerElementoPorElementoUID({
                        elementoUID,
                        errorSi: "desactivado"
                    })
                    if (!elemento) {
                        og.elementoEnlazado.nombre = "Elemento no encontrado en el inventario"
                    } else {
                        og.elementoEnlazado.nombre = elemento.nombre
                    }

                }
            }
        }

        delete servicio.testingVI
        const ok = {
            ok: servicio
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}