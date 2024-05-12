import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerBloqueoPorBloqueoUID } from "../../../repositorio/bloqueos/obtenerBloqueoPorBloqueoUID.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";

export const detallesDelBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const bloqueoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de bloqueoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        console.log("test")
        await eliminarBloqueoCaducado();
        const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
        const detallesDelBloqueo = await obtenerBloqueoPorBloqueoUID(bloqueoUID)
        console.log("test")
        if (detallesDelBloqueo.rowCount === 0) {
            const error = "No existe el bloqueo, comprueba el apartamentoIDV y el bloqueoUID";
            throw new Error(error);
        }
        if (detallesDelBloqueo.rowCount === 1) {
            const bloqueosEncontradosDelApartamento = detallesDelBloqueo.rows[0];
            const uidBloqueo = bloqueosEncontradosDelApartamento.uid;
            const tipoBloqueo = bloqueosEncontradosDelApartamento.tipoBloqueo;
            const entrada = bloqueosEncontradosDelApartamento.entrada;
            const salida_ = bloqueosEncontradosDelApartamento.salida;
            const motivo = bloqueosEncontradosDelApartamento.motivo;
            const zona = bloqueosEncontradosDelApartamento.zona;
            const estructuraBloqueo = {
                uidBloqueo: uidBloqueo,
                tipoBloqueo: tipoBloqueo,
                entrada: entrada,
                salida: salida_,
                motivo: motivo,
                zona: zona
            };
            const ok = {};
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = estructuraBloqueo;
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}