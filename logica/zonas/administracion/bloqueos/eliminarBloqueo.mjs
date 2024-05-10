import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const eliminarBloqueo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return
        
        const bloqueoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de bloqueoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const seleccionarBloqueo = await conexion.query(`SELECT uid, apartamento FROM "bloqueosApartamentos" WHERE uid = $1`, [bloqueoUID]);
        if (seleccionarBloqueo.rowCount === 0) {
            const error = "No existe el bloqueo que se quiere eliminar.";
            throw new Error(error);
        }
        const apartmamentoIDV = seleccionarBloqueo.rows[0].apartamento;
        const ContarBloqueosPorApartamento = await conexion.query(`SELECT apartamento FROM "bloqueosApartamentos" WHERE apartamento = $1`, [apartmamentoIDV]);
        let tipoDeRetroceso;
        if (ContarBloqueosPorApartamento.rowCount === 1) {
            tipoDeRetroceso = "aPortada";
        }
        if (ContarBloqueosPorApartamento.rowCount > 1) {
            tipoDeRetroceso = "aApartamento";
        }
        const eliminarBloqueo = `
                                    DELETE FROM "bloqueosApartamentos"
                                    WHERE uid = $1;
                                    `;
        const resuelveEliminarBloqueo = await conexion.query(eliminarBloqueo, [bloqueoUID]);
        if (resuelveEliminarBloqueo.rowCount === 0) {
            const error = "No se ha eliminado el bloqueo";
            throw new Error(error);
        }
        if (resuelveEliminarBloqueo.rowCount === 1) {
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