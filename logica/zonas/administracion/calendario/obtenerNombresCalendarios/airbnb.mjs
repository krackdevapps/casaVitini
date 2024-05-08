import { conexion } from "../../../../componentes/db.mjs";
import { resolverApartamentoUI } from "../../../../sistema/resolucion/resolverApartamentoUI.mjs";
export const airbnb = async (entrada, salida) => {
    try {
        const ok = {
            ok: "Lista con metadtos de los calendarios sincronizados de airbnb",
            calendariosSincronizados: []
        };
        const plataformaOrigen = "airbnb";
        const consultaCalendarios = `
                                SELECT
                                    uid,
                                    nombre,
                                    "apartamentoIDV"
                                FROM 
                                    "calendariosSincronizados"
                                WHERE 
                                    "plataformaOrigen" = $1;`;
        const resuelveCalendarios = await conexion.query(consultaCalendarios, [plataformaOrigen]);
        for (const detallesDelCalendario of resuelveCalendarios.rows) {
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
            detallesDelCalendario.apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
        }
        ok.calendariosSincronizados = [...resuelveCalendarios.rows];
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    }
}