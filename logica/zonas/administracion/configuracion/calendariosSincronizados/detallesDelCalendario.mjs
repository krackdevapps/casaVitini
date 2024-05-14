import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerCalendarioPorCalendarioUID } from "../../../../repositorio/configuracion/calendarioSincronizados/obtenerCalendarioPorCalendarioUID.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const detallesDelCalendario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const calendarioSincronziado = await obtenerCalendarioPorCalendarioUID(calendarioUID)
        const apartamentoIDV = calendarioSincronziado.apartamentoIDV;
        const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
        calendarioSincronziado.apartamentoUI = apartamentoUI;

        const ok = {
            ok: calendarioSincronziado
        }
        salida.json(ok);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}