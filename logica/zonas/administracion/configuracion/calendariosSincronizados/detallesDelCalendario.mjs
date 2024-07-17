import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerCalendarioPorCalendarioUID } from "../../../../repositorio/calendario/obtenerCalendarioPorCalendarioUID.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
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
        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        }).apartamentoUI;
        calendarioSincronziado.apartamentoUI = apartamentoUI;

        const ok = {
            ok: calendarioSincronziado
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}