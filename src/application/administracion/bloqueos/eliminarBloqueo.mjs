import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { eliminarBloqueoPorBloqueoUID } from "../../../infraestructure/repository/bloqueos/eliminarBloqueoPorBloqueoUID.mjs";
import { obtenerBloqueoPorBloqueoUID } from "../../../infraestructure/repository/bloqueos/obtenerBloqueoPorBloqueoUID.mjs";
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from "../../../infraestructure/repository/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs";

export const eliminarBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const bloqueoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de la bloque (bloqueoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const bloqueoSeleccionado = await obtenerBloqueoPorBloqueoUID(bloqueoUID)
        const apartmamentoIDV = bloqueoSeleccionado.apartamentoIDV;
        const eliminarBloqueo = await eliminarBloqueoPorBloqueoUID(bloqueoUID)

        const bloqueosPorApartamento = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartmamentoIDV)
        let tipoDeRetroceso;
        if (bloqueosPorApartamento.length === 0) {
            tipoDeRetroceso = "aPortada";
        }
        if (bloqueosPorApartamento.length >= 1) {
            tipoDeRetroceso = "aApartamento";
        }

        const ok = {
            ok: "Se ha eliminado el bloqueo correctamente",
            tipoRetroceso: tipoDeRetroceso
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}