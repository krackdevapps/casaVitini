import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerCalendarioPorCalendarioUID } from "../../../../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUID.mjs";
import { eliminarCalendarioSincronizadoPorCalendarioUID } from "../../../../../infraestructure/repository/calendario/eliminarCalendarioSincronizadoPorCalendarioUID.mjs";

export const eliminarCalendario = async (entrada, salida) => {

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await obtenerCalendarioPorCalendarioUID(calendarioUID)
        await eliminarCalendarioSincronizadoPorCalendarioUID(calendarioUID)
        const ok = {
            ok: "Se ha eliminado correctamente el calendario"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}