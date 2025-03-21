import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerServicioPorServicioUID } from "../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs";

export const detallesServicio = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

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
            devuelveUnTipoBigInt: "si"
        })
        const servicio = await obtenerServicioPorServicioUID(servicioUID)
        delete servicio.testingVI
        const ok = {
            ok: servicio
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}