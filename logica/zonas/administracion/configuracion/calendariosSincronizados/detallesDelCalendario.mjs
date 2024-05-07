import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { resolverApartamentoUI } from "../../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const detallesDelCalendario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })     
   
        const ok = {
            ok: []
        };
        const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    uid = $1
                                    `;
        const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [calendarioUID]);
        if (resuelveCalendariosSincronizados.rowCount > 0) {
            for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                detallesDelCalendario.apartamentoUI = apartamentoUI;
            }
            ok.ok = resuelveCalendariosSincronizados.rows[0];
        } else {
            const error = "No existe ningun calendario con ese identificador, revisa el identificador.";
            throw new Error(error);
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}