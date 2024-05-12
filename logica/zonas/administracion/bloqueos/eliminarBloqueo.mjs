import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { eliminarBloqueoPorBloqueoUID } from "../../../repositorio/bloqueos/eliminarBloqueoPorBloqueoUID.mjs";
import { obtenerBloqueoPorBloqueoUID } from "../../../repositorio/bloqueos/obtenerBloqueoPorBloqueoUID.mjs";
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from "../../../repositorio/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs";

export const eliminarBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const bloqueoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de bloqueoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const bloqueoSeleccionado = await obtenerBloqueoPorBloqueoUID(bloqueoUID)
        if (bloqueoSeleccionado.length === 0) {
            const error = "No existe el bloqueo que se quiere eliminar.";
            throw new Error(error);
        }
        const apartmamentoIDV = bloqueoSeleccionado[0].apartamento;
        const bloqueosPorApartamento = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartmamentoIDV)
        let tipoDeRetroceso;
        if (bloqueosPorApartamento.length === 1) {
            tipoDeRetroceso = "aPortada";
        }
        if (bloqueosPorApartamento.length> 1) {
            tipoDeRetroceso = "aApartamento";
        }
        const eliminarBloqueo = await eliminarBloqueoPorBloqueoUID(bloqueoUID)
        if (eliminarBloqueo.rowCount === 0) {
            const error = "No se ha eliminado el bloqueo";
            throw new Error(error);
        }
        if (eliminarBloqueo.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado el bloqueo correctamente",
                tipoRetroceso: tipoDeRetroceso
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}