import { conexion } from "../../../componentes/db.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const detallesDelBloqueo = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const bloqueoUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de bloqueoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        await eliminarBloqueoCaducado();
        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
        const consultaDetallesBloqueo = `
                            SELECT
                            uid,
                            to_char(entrada, 'DD/MM/YYYY') as entrada, 
                            to_char(salida, 'DD/MM/YYYY') as salida, 
                            apartamento,
                            "tipoBloqueo",
                            motivo,
                            zona
                            FROM "bloqueosApartamentos"
                            WHERE apartamento = $1 AND uid = $2;`;
        const resuelveConsultaDetallesBloqueo = await conexion.query(consultaDetallesBloqueo, [apartamentoIDV, bloqueoUID]);
        if (resuelveConsultaDetallesBloqueo.rowCount === 0) {
            const error = "No existe el bloqueo, comprueba el apartamentoIDV y el bloqueoUID";
            throw new Error(error);
        }
        if (resuelveConsultaDetallesBloqueo.rowCount === 1) {
            const bloqueosEncontradosDelApartamento = resuelveConsultaDetallesBloqueo.rows[0];
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
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}